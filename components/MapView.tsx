
import React, { useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { LatLng, RouteData } from '../types';
import { GOOGLE_MAPS_STYLING } from '../constants';

interface MapViewProps {
  routes: RouteData[];
  selectedRouteId: string | null;
  center: LatLng;
}

export const MapView: React.FC<MapViewProps> = ({ routes, selectedRouteId, center }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const polylinesRef = useRef<any[]>([]);
  const geometryLibRef = useRef<any>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      setOptions({
        apiKey: process.env.API_KEY || '',
        version: 'weekly'
      });

      try {
        const { Map, TrafficLayer } = await importLibrary('maps') as any;
        const geometry = await importLibrary('geometry') as any;
        geometryLibRef.current = geometry;

        if (!googleMapRef.current) {
          // IMPORTANT: Do not add mapId here. 
          // ApiProjectMapError is caused by using a Map ID not associated with the project/key.
          // Using 'styles' provides custom styling without needing a cloud-hosted Map ID.
          googleMapRef.current = new Map(mapRef.current, {
            center,
            zoom: 11,
            styles: GOOGLE_MAPS_STYLING,
            disableDefaultUI: true,
            zoomControl: true,
            // Confine viewport to Bengaluru area
            restriction: {
              latLngBounds: {
                north: 13.15,
                south: 12.80,
                west: 77.40,
                east: 77.80,
              },
              strictBounds: false,
            },
          });

          const trafficLayer = new TrafficLayer();
          trafficLayer.setMap(googleMapRef.current);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.panTo(center);
    }
  }, [center]);

  useEffect(() => {
    if (!googleMapRef.current || !geometryLibRef.current) return;

    // Clear previous polylines from the map instance
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    // Render the decoded polylines for each route
    routes.forEach(route => {
      const isSelected = route.id === selectedRouteId;
      const google = (window as any).google;
      if (!google || !google.maps) return;

      const polyline = new google.maps.Polyline({
        path: geometryLibRef.current.encoding.decodePath(route.polyline.encodedPolyline),
        geodesic: true,
        strokeColor: isSelected ? '#3b82f6' : '#94a3b8',
        strokeOpacity: isSelected ? 1.0 : 0.6,
        strokeWeight: isSelected ? 6 : 4,
        zIndex: isSelected ? 100 : 1,
        map: googleMapRef.current
      });
      polylinesRef.current.push(polyline);
    });
  }, [routes, selectedRouteId]);

  return <div ref={mapRef} className="w-full h-full" />;
};
