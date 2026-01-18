
import { LatLng, RouteData } from "../types";

export const fetchRoutesV2 = async (origin: LatLng, destination: LatLng): Promise<any[]> => {
  // In a real environment, we would use the Routes V2 API with 'routingPreference: TRAFFIC_AWARE'
  // for actual real-time durations.
  return [
    {
      id: "blr_route_1",
      duration: "3420s", // ~57 mins (Real-time)
      distanceMeters: 22000,
      polyline: { encodedPolyline: "mvvnAuexzM?_@?_@?m@?q@?" }, 
      durationHistorical: "2400s", // Usually 40 mins
      description: "Via Outer Ring Road. Heavy congestion near Marathahalli."
    },
    {
      id: "blr_route_2",
      duration: "3900s", // ~65 mins (Real-time)
      distanceMeters: 25000,
      polyline: { encodedPolyline: "mvvnAuexzM?e@?e@?g@?i@?" },
      durationHistorical: "3850s", // Usually 64 mins
      description: "Via Old Airport Road. Consistently slow but no unexpected spikes."
    }
  ];
};
