
export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteData {
  id: string;
  duration: string;
  distanceMeters: number;
  polyline: {
    encodedPolyline: string;
  };
  durationHistorical: string;
  trendScore: number;
  reliability: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface TrafficAnalysisResponse {
  routes: RouteData[];
}
