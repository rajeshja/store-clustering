'use server';

import { clusterStores } from '@/ai/flows/cluster-stores';
import { parseCsv } from '@/lib/csv-parser';
import type { Store } from '@/types';

export async function getClusters(
  csvData: string,
  numClusters: number
): Promise<{ stores: Store[], error?: string }> {
  try {
    const stores = parseCsv(csvData);
    if (stores.length === 0) {
      return { stores: [], error: 'No valid store data found in the uploaded file.' };
    }

    const aiResult = await clusterStores({
      csvData,
      numClusters,
    });

    const storeMap = new Map(stores.map(s => [s.storeId, s]));
    const clusteredStores: Store[] = [];

    aiResult.clusters.forEach((cluster, clusterIndex) => {
      cluster.storeIds.forEach(storeId => {
        const store = storeMap.get(storeId);
        if (store) {
          clusteredStores.push({ ...store, clusterId: clusterIndex });
        }
      });
    });

    return { stores: clusteredStores };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during clustering.';
    return { stores: [], error: errorMessage };
  }
}
