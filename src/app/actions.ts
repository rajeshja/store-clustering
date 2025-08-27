'use server';

import { kmeans } from 'ml-kmeans';
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
    
    if (stores.length < numClusters) {
      return { stores: [], error: 'Number of stores is less than the number of clusters.' };
    }

    const coordinates = stores.map(s => [s.latitude, s.longitude]);
    const result = kmeans(coordinates, numClusters);
    
    const clusteredStores = stores.map((store, i) => ({
      ...store,
      clusterId: result.clusters[i],
    }));

    return { stores: clusteredStores };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during clustering.';
    return { stores: [], error: errorMessage };
  }
}
