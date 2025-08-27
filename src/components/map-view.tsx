'use client';

import { APIProvider, AdvancedMarker, InfoWindow, Map, Pin } from '@vis.gl/react-google-maps';
import React, { useState, useMemo } from 'react';
import type { Store } from '@/types';
import { getStoreIcon } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const CLUSTER_COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF',
  '#33FFA1', '#FFC300', '#F94144', '#F3722C', '#F8961E'
];

interface MapViewProps {
  stores: Store[];
}

export function MapView({ stores }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const center = useMemo(() => {
    if (stores.length === 0) {
      return { lat: 40.7128, lng: -74.0060 }; // Default to NYC
    }
    const avgLat = stores.reduce((sum, s) => sum + s.latitude, 0) / stores.length;
    const avgLng = stores.reduce((sum, s) => sum + s.longitude, 0) / stores.length;
    return { lat: avgLat, lng: avgLng };
  }, [stores]);
  
  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Configuration Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Google Maps API Key is missing.</p>
            <p className="text-sm text-muted-foreground">Please add <code className="bg-primary/10 p-1 rounded-sm">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your .env.local file.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stores.length === 0) {
     return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <Card className="text-center">
            <CardHeader>
                <CardTitle>No Stores to Display</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Upload a CSV file to see your stores on the map.</p>
            </CardContent>
        </Card>
      </div>
     )
  }

  return (
    <div className="w-full h-full bg-muted rounded-lg overflow-hidden">
      <APIProvider apiKey={apiKey}>
        <Map
          mapId="store-mapper-map"
          style={{ width: '100%', height: '100%' }}
          defaultCenter={center}
          center={center}
          defaultZoom={10}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapTypeId='roadmap'
        >
          {stores.map(store => {
            const Icon = getStoreIcon(store.type);
            const color = store.clusterId !== undefined ? CLUSTER_COLORS[store.clusterId % CLUSTER_COLORS.length] : '#808080';

            return (
              <AdvancedMarker
                key={store.storeId}
                position={{ lat: store.latitude, lng: store.longitude }}
                onClick={() => setSelectedStore(store)}
              >
                <Pin background={color} borderColor={'#fff'} glyph={<Icon className="h-6 w-6 text-white" />} />
              </AdvancedMarker>
            );
          })}

          {selectedStore && (
            <InfoWindow
              position={{ lat: selectedStore.latitude, lng: selectedStore.longitude }}
              onCloseClick={() => setSelectedStore(null)}
              pixelOffset={[0, -40]}
            >
              <div className="p-1 min-w-48">
                <h3 className="font-bold text-base">{selectedStore.name}</h3>
                <p className="text-sm capitalize text-muted-foreground">{selectedStore.type} Store</p>
                {selectedStore.clusterId !== undefined && (
                  <p className="text-sm font-medium" style={{color: CLUSTER_COLORS[selectedStore.clusterId % CLUSTER_COLORS.length]}}>
                    Cluster {selectedStore.clusterId + 1}
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
