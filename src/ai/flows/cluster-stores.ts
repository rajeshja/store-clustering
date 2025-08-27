'use server';

/**
 * @fileOverview This file contains the Genkit flow for clustering store locations based on geographic proximity.
 *
 * - clusterStores - A function that takes a CSV file of store locations and clusters them into optimal groups.
 * - ClusterStoresInput - The input type for the clusterStores function.
 * - ClusterStoresOutput - The return type for the clusterStores function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClusterStoresInputSchema = z.object({
  csvData: z
    .string()
    .describe('CSV data containing store details including latitude and longitude.'),
  numClusters: z
    .number()
    .min(5)
    .max(10)
    .default(7) // sensible default
    .describe('The desired number of store clusters (between 5 and 10).'),
});
export type ClusterStoresInput = z.infer<typeof ClusterStoresInputSchema>;

const ClusterStoresOutputSchema = z.object({
  clusters: z.array(
    z.object({
      storeIds: z.array(z.string()).describe('List of store IDs in this cluster.'),
      latitude: z.number().describe('The latitude of the cluster centroid.'),
      longitude: z.number().describe('The longitude of the cluster centroid.'),
    })
  ).describe('An array of store clusters, each with a list of store IDs and the cluster centroid coordinates.'),
});
export type ClusterStoresOutput = z.infer<typeof ClusterStoresOutputSchema>;

export async function clusterStores(input: ClusterStoresInput): Promise<ClusterStoresOutput> {
  return clusterStoresFlow(input);
}

const prompt = ai.definePrompt({
  name: 'clusterStoresPrompt',
  input: {schema: ClusterStoresInputSchema},
  output: {schema: ClusterStoresOutputSchema},
  prompt: `You are a location analyst. Given the following CSV data of store locations, cluster them into {{numClusters}} optimal groups based on geographic proximity using a machine learning model.

CSV Data:
{{csvData}}

Return a JSON object representing the clusters. Each cluster should contain an array of store IDs (assuming the CSV has a column named 'storeId') and the latitude/longitude coordinates of the cluster's centroid.

Make sure the 'storeId' values are strings.

Output the data in the following format:
${JSON.stringify(ClusterStoresOutputSchema.shape, null, 2)}`,
});

const clusterStoresFlow = ai.defineFlow(
  {
    name: 'clusterStoresFlow',
    inputSchema: ClusterStoresInputSchema,
    outputSchema: ClusterStoresOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
