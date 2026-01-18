
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LatLng, RouteData } from '../types';

interface MapViewProps {
  routes: RouteData[];
  selectedRouteId: string | null;
  center: LatLng;
  startMarker: LatLng | null;
  endMarker: LatLng | null;
}

export const MapView: React.FC<MapViewProps> = ({ routes, selectedRouteId, center, startMarker, endMarker }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  const getTrafficColor = (route: RouteData) => {
    const current = parseInt(route.duration);
    const historical = parseInt(route.durationHistorical);
    const ratio = current / historical;
    if (ratio > 1.3) return '#ef4444'; 
    if (ratio > 1.1) return '#f59e0b';
    return '#22c55e';
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([center.lat, center.lng], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapRef.current);
    layersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => { mapRef.current?.remove(); };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !layersRef.current) return;

    layersRef.current.clearLayers();
    const bounds = L.latLngBounds([]);

    // 1. Add Start/End Markers
    if (startMarker) {
      const startIco = L.divIcon({
        html: `<div class="w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-[8px] font-black text-white">S</div>`,
        className: '',
        iconSize: [24, 24]
      });
      L.marker([startMarker.lat, startMarker.lng], { icon: startIco }).addTo(layersRef.current);
      bounds.extend([startMarker.lat, startMarker.lng]);
    }

    if (endMarker) {
      const endIco = L.divIcon({
        html: `<div class="w-6 h-6 bg-red-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-[8px] font-black text-white">E</div>`,
        className: '',
        iconSize: [24, 24]
      });
      L.marker([endMarker.lat, endMarker.lng], { icon: endIco }).addTo(layersRef.current);
      bounds.extend([endMarker.lat, endMarker.lng]);
    }

    // 2. Draw Routes
    const sortedRoutes = [...routes].sort((a, b) => (a.id === selectedRouteId ? 1 : -1));

    sortedRoutes.forEach(route => {
      const isSelected = route.id === selectedRouteId;
      const points = decodePolyline(route.polyline.encodedPolyline);
      const trafficColor = getTrafficColor(route);
      
      if (isSelected) {
        L.polyline(points, { color: trafficColor, weight: 12, opacity: 0.2 }).addTo(layersRef.current!);
      }

      const polyline = L.polyline(points, {
        color: trafficColor,
        weight: isSelected ? 6 : 3,
        opacity: isSelected ? 1 : 0.3,
        lineCap: 'round',
      }).addTo(layersRef.current!);

      if (isSelected) {
        polyline.bringToFront();
        polyline.getBounds().isValid() && bounds.extend(polyline.getBounds());
      }
    });

    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [120, 120], animate: true });
    }
  }, [routes, selectedRouteId, startMarker, endMarker]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

function decodePolyline(encoded: string): [number, number][] {
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  const array: [number, number][] = [];
  while (index < len) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += ((result & 1) ? ~(result >> 1) : (result >> 1));
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += ((result & 1) ? ~(result >> 1) : (result >> 1));
    array.push([lat * 1e-5, lng * 1e-5]);
  }
  return array;
}
