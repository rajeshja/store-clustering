import type { Store } from '@/types';

export function parseCsv(csvData: string): Store[] {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }

  const header = lines[0].split(',').map(h => h.trim());
  const storeIdIndex = header.indexOf('store-id');
  const nameIndex = header.indexOf('store-name');
  const typeIndex = header.indexOf('store-type');
  const latitudeIndex = header.indexOf('store-latitude');
  const longitudeIndex = header.indexOf('store-longitude');
  const workingHoursIndex = header.indexOf('working_hours');


  if (storeIdIndex === -1 || nameIndex === -1 || typeIndex === -1 || latitudeIndex === -1 || longitudeIndex === -1 || workingHoursIndex === -1) {
    throw new Error('CSV must contain store-id, store-name, store-type, store-latitude, store-longitude, and working_hours columns.');
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
      workingHours: values[workingHoursIndex].trim(),
    };
    
    if (isNaN(store.latitude) || isNaN(store.longitude)) {
        console.warn(`Skipping line with invalid coordinates ${index + 2}: ${line}`);
        return null;
    }

    return store;
  }).filter((store): store is Store => store !== null);
}
