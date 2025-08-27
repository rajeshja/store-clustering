'use client';

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
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const bounds = useMemo(() => {
    if (stores.length === 0) {
      return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
    }
    const lats = stores.map(s => s.latitude);
    const lngs = stores.map(s => s.longitude);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [stores]);

  const getPosition = (store: Store) => {
    const { minLat, maxLat, minLng, maxLng } = bounds;
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;

    // Avoid division by zero if all points are the same
    const x = lngRange === 0 ? 50 : ((store.longitude - minLng) / lngRange) * 100;
    // Invert latitude for correct screen orientation (higher lat is more north, so smaller y)
    const y = latRange === 0 ? 50 : (1 - (store.latitude - minLat) / latRange) * 100;
    
    return { x, y };
  };

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
    <div className="w-full h-full bg-muted rounded-lg overflow-hidden relative" onClick={() => setSelectedStore(null)}>
      {stores.map(store => {
        const { x, y } = getPosition(store);
        const Icon = getStoreIcon(store.type);
        const color = store.clusterId !== undefined ? CLUSTER_COLORS[store.clusterId % CLUSTER_COLORS.length] : '#808080';

        return (
          <button
            key={store.storeId}
            style={{ 
              left: `${x}%`, 
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: color,
            }}
            className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-125"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStore(store);
            }}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}

      {selectedStore && (
        <div 
          className="absolute bg-card rounded-lg shadow-xl p-3 min-w-48 border"
          style={{ 
            left: `${getPosition(selectedStore).x}%`, 
            top: `${getPosition(selectedStore).y}%`, 
            transform: 'translate(-50%, calc(-100% - 20px))'
          }}
        >
            <h3 className="font-bold text-base">{selectedStore.name}</h3>
            <p className="text-sm capitalize text-muted-foreground">{selectedStore.type} Store</p>
            {selectedStore.clusterId !== undefined && (
              <p className="text-sm font-medium" style={{color: CLUSTER_COLORS[selectedStore.clusterId % CLUSTER_COLORS.length]}}>
                Cluster {selectedStore.clusterId + 1}
              </p>
            )}
        </div>
      )}
    </div>
  );
}
