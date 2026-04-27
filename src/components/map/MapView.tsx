'use client';

import { useEffect, useRef } from 'react';
import type { Layer, Map as LeafletMap } from 'leaflet';
import type { LandRecord } from '@/types';

const STATUS_COLORS: Record<LandRecord['status'], string> = {
  registered: '#22c55e',
  pending: '#f59e0b',
  disputed: '#ef4444',
};

interface MapViewProps {
  properties: LandRecord[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedId?: string;
  onPropertyClick?: (property: LandRecord) => void;
  showDraw?: boolean;
  onPolygonDrawn?: (coordinates: number[][][], area?: number) => void;
}

const DEFAULT_CENTER: [number, number] = [18.5204, 73.8567];

export default function MapView({
  properties,
  center = DEFAULT_CENTER,
  zoom = 12,
  height = '100%',
  selectedId,
  onPropertyClick,
  showDraw = false,
  onPolygonDrawn,
}: MapViewProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<Record<string, Layer>>({});

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || mapRef.current) return;

    let mounted = true;
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet-draw');

      if (!mounted || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      if (showDraw) {
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        const DrawControlCtor = (L.Control as unknown as { Draw: new (options: object) => L.Control }).Draw;
        const drawControl = new DrawControlCtor({
          edit: { featureGroup: drawnItems },
          draw: {
            polygon: {
              allowIntersection: false,
              showArea: true,
              shapeOptions: { color: '#63be7b', fillOpacity: 0.3 },
            },
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false,
          },
        });
        map.addControl(drawControl);

        map.on('draw:created', (event: unknown) => {
          const e = event as { layer: { getLatLngs: () => Array<Array<{ lat: number; lng: number }>> } };
          drawnItems.clearLayers();
          drawnItems.addLayer(e.layer as unknown as Layer);
          if (!onPolygonDrawn) return;
          const latlngs = e.layer.getLatLngs()[0];
          const coords = latlngs.map((point) => [point.lng, point.lat] as [number, number]);
          if (coords.length > 0) coords.push(coords[0]);
          
          let area = 0;
          if ((L as any).GeometryUtil && (L as any).GeometryUtil.geodesicArea) {
            area = (L as any).GeometryUtil.geodesicArea(latlngs);
          }
          onPolygonDrawn([coords], area);
        });
      }
    };

    void initMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layersRef.current = {};
      }
    };
  }, [center, onPolygonDrawn, showDraw, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    const redraw = async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !mapRef.current) return;
      const map = mapRef.current;

      Object.values(layersRef.current).forEach((layer) => map.removeLayer(layer));
      layersRef.current = {};

      properties.forEach((property) => {
        const id = property.id || property._id;
        const color = STATUS_COLORS[property.status];
        const selected = id === selectedId;

        const popup = `
          <div style="min-width:200px;font-family:Inter,sans-serif">
            <strong style="font-size:14px">${property.registryNumber || property.title}</strong>
            <div style="margin-top:8px;font-size:12px">
              <div>Owner: ${property.ownerName}</div>
              <div>Area: ${property.area.toLocaleString()} m²</div>
              <div>Status: ${property.status}</div>
            </div>
            <a href="/properties/${id}" style="display:block;margin-top:10px;color:${color};text-decoration:none;font-weight:600">
              View details
            </a>
          </div>
        `;

        let centerPoint: [number, number];
        let layer: Layer;

        if (property.geometry?.coordinates?.[0]) {
          const ring = property.geometry.coordinates[0];
          const latLngs = ring.map(([lng, lat]) => [lat, lng] as [number, number]);
          const polygon = L.polygon(latLngs, {
            color,
            fillColor: color,
            fillOpacity: selected ? 0.45 : 0.2,
            weight: selected ? 3 : 2,
            dashArray: property.status === 'registered' ? undefined : '6 4',
          });
          polygon.bindPopup(popup, { maxWidth: 280 });
          polygon.on('click', () => onPropertyClick?.(property));
          polygon.addTo(map);
          layer = polygon;
          const centroid = property.centroid ?? {
            lat: ring.reduce((sum, point) => sum + point[1], 0) / ring.length,
            lng: ring.reduce((sum, point) => sum + point[0], 0) / ring.length,
          };
          centerPoint = [centroid.lat, centroid.lng];
        } else {
          const [lng, lat] = property.location.coordinates;
          const circle = L.circle([lat, lng], {
            radius: Math.max(Math.sqrt(property.area) * 0.5, 20),
            color,
            fillColor: color,
            fillOpacity: selected ? 0.45 : 0.2,
            weight: selected ? 3 : 2,
            dashArray: property.status === 'registered' ? undefined : '6 4',
          });
          circle.bindPopup(popup, { maxWidth: 280 });
          circle.on('click', () => onPropertyClick?.(property));
          circle.addTo(map);
          layer = circle;
          centerPoint = [lat, lng];
        }

        layersRef.current[id] = layer;
        if (selected) {
          map.flyTo(centerPoint, 15, { duration: 0.6 });
        }
      });
    };

    void redraw();
    return () => {
      cancelled = true;
    };
  }, [onPropertyClick, properties, selectedId]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-primary)',
      }}
    />
  );
}
