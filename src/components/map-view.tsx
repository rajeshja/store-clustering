'use client';

import React, { useState, useMemo, useRef } from 'react';
import type { Store } from '@/types';
import { getStoreIcon } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

const CLUSTER_COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF',
  '#33FFA1', '#FFC300', '#F94144', '#F3722C', '#F8961E'
];

interface MapViewProps {
  stores: Store[];
}

export function MapView({ stores }: MapViewProps) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

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

    const x = lngRange === 0 ? 50 : ((store.longitude - minLng) / lngRange) * 100;
    const y = latRange === 0 ? 50 : (1 - (store.latitude - minLat) / latRange) * 100;
    
    return { x, y };
  };
  
  const handleZoomIn = () => setZoom(z => Math.min(z * 1.2, 5));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.2, 0.2));

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };
  
  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
      setZoom(z => Math.min(z * zoomFactor, 5));
    } else {
      setZoom(z => Math.max(z / zoomFactor, 0.2));
    }
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
    <div 
      className="w-full h-full bg-muted rounded-lg overflow-hidden relative"
      ref={mapRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      onClick={() => selectedStore && setSelectedStore(null)}
    >
        <div 
            className="w-full h-full relative"
            style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                transformOrigin: 'center center'
            }}
        >
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
        </div>

      {selectedStore && (
        <div 
          className="absolute bg-card rounded-lg shadow-xl p-3 min-w-48 border"
          style={{ 
            left: `calc(${getPosition(selectedStore).x}%`, 
            top: `calc(${getPosition(selectedStore).y}% - 12px)`, 
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
          }}
        >
            <h3 className="font-bold text-base">{selectedStore.name}</h3>
            <p className="text-sm capitalize text-muted-foreground">{selectedStore.type} Store</p>
            {selectedStore.workingHours && (
              <p className="text-sm text-muted-foreground">Hours: {selectedStore.workingHours}</p>
            )}
            {selectedStore.clusterId !== undefined && (
              <p className="text-sm font-medium" style={{color: CLUSTER_COLORS[selectedStore.clusterId % CLUSTER_COLORS.length]}}>
                Cluster {selectedStore.clusterId + 1}
              </p>
            )}
        </div>
      )}

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button size="icon" onClick={handleZoomIn} aria-label="Zoom in">
              <ZoomIn />
          </Button>
          <Button size="icon" onClick={handleZoomOut} aria-label="Zoom out">
              <ZoomOut />
          </Button>
      </div>
    </div>
  );
}
