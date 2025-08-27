'use client';

import React, { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarContent } from '@/components/ui/sidebar';
import { StoreImporter } from '@/components/store-importer';
import { MapView } from '@/components/map-view';
import type { Store } from '@/types';

export default function Home() {
  const [stores, setStores] = useState<Store[]>([]);

  const handleClusteringComplete = (clusteredStores: Store[]) => {
    setStores(clusteredStores);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="p-0">
          <StoreImporter onClusteringComplete={handleClusteringComplete} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <MapView stores={stores} />
      </SidebarInset>
    </SidebarProvider>
  );
}
