import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
  points: Array<[number, number, number]>;
}

export function HeatmapLayer({ points }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    
    // Check if L.heatLayer exists (it should via import 'leaflet.heat')
    if (!(L as any).heatLayer) {
        console.error("leaflet.heat plugin not loaded");
        return;
    }

    const heatLayer = (L as any).heatLayer(points, {
      radius: 50,
      blur: 35,
      maxZoom: 10,
      max: 1.5, // Much lower threshold so it reaches Red faster
      gradient: {
        0.1: '#3b82f6', // Blue
        0.3: '#10b981', // Emerald
        0.5: '#eab308', // Yellow
        0.7: '#f97316', // Orange
        1.0: '#ef4444'  // Red
      }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}
