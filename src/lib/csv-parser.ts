import type { Store } from '@/types';

export function parseCsv(csvData: string): Store[] {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }

  const header = lines[0].split(',').map(h => h.trim());
  const storeIdIndex = header.indexOf('storeId');
  const nameIndex = header.indexOf('name');
  const typeIndex = header.indexOf('type');
  const latitudeIndex = header.indexOf('latitude');
  const longitudeIndex = header.indexOf('longitude');

  if (storeIdIndex === -1 || nameIndex === -1 || typeIndex === -1 || latitudeIndex === -1 || longitudeIndex === -1) {
    throw new Error('CSV must contain storeId, name, type, latitude, and longitude columns.');
  }

  return lines.slice(1).map((line, index) => {
    const values = line.split(',');
    
    if (values.length !== header.length) {
      console.warn(`Skipping malformed CSV line ${index + 2}: ${line}`);
      return null;
    }
    
    const type = values[typeIndex].trim().toLowerCase();

    const store: Store = {
      storeId: values[storeIdIndex].trim(),
      name: values[nameIndex].trim(),
      type: type === 'supermarket' || type === 'express' ? type : 'default',
      latitude: parseFloat(values[latitudeIndex]),
      longitude: parseFloat(values[longitudeIndex]),
    };
    
    if (isNaN(store.latitude) || isNaN(store.longitude)) {
        console.warn(`Skipping line with invalid coordinates ${index + 2}: ${line}`);
        return null;
    }

    return store;
  }).filter((store): store is Store => store !== null);
}
