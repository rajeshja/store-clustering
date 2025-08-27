export interface Store {
  storeId: string;
  name: string;
  type: 'supermarket' | 'express' | 'dark store' | 'default';
  latitude: number;
  longitude: number;
  clusterId?: number;
  workingHours: string;
}

export interface Cluster {
  clusterId: number;
  stores: Store[];
  center: {
    lat: number;
    lng: number;
  };
}
