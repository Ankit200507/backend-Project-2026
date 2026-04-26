'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { Map as LeafletMap, Layer } from 'leaflet';
import type { Property } from '@/types';
import { STATUS_COLORS } from '@/lib/mockData';

interface MapViewProps {
    properties: Property[];
    center?: [number, number];
    zoom?: number;
    height?: string;
    selectedId?: string;
    onPropertyClick?: (property: Property) => void;
    showDraw?: boolean;
    onPolygonDrawn?: (coordinates: number[][][]) => void;
}

export default function MapView({
    properties,
    center = [18.5204, 73.8567],
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

    const createPopupContent = useCallback((prop: Property, color: string) => {
        const propId = prop._id;
        const displayId = prop.registryNumber || prop.title;
        
        return `
            <div style="font-family:Inter,sans-serif;min-width:220px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                    <div style="width:10px;height:10px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color}88;flex-shrink:0"></div>
                    <strong style="font-size:14px;color:#f0f4ff;font-family:'Space Grotesk',sans-serif">${displayId}</strong>
                </div>
                <div style="display:grid;gap:6px;font-size:12px">
                    <div style="display:flex;justify-content:space-between;gap:12px">
                        <span style="color:#555f72;font-weight:500">Title</span>
                        <span style="color:#f0f4ff;font-weight:600">${prop.title}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:12px">
                        <span style="color:#555f72;font-weight:500">Area</span>
                        <span style="color:#f0f4ff;font-weight:600">${prop.area.toLocaleString()} m²</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:12px">
                        <span style="color:#555f72;font-weight:500">Type</span>
                        <span style="color:#f0f4ff;font-weight:600">${prop.propertyType}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:12px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.08)">
                        <span style="color:#555f72;font-weight:500">Status</span>
                        <span style="font-weight:700;color:${color};text-transform:capitalize">${prop.status}</span>
                    </div>
                </div>
                <a href="/properties/${prop.registryNumber || propId}" style="display:block;margin-top:12px;text-align:center;background:rgba(99,190,123,0.15);border:1px solid rgba(99,190,123,0.3);border-radius:8px;padding:7px;font-size:12px;font-weight:600;color:#63be7b;text-decoration:none">
                    View Full Record →
                </a>
            </div>
        `;
    }, []);

    const renderLayers = useCallback(async (L: any) => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        // Remove old layers
        Object.values(layersRef.current).forEach(l => map.removeLayer(l));
        layersRef.current = {};

        properties.forEach(prop => {
            const color = STATUS_COLORS[prop.status as keyof typeof STATUS_COLORS] || '#63be7b';
            const propId = prop._id;
            const isSelected = propId === selectedId;

            let layer: Layer;

            // Render polygon if geometry exists, otherwise render circle marker
            if (prop.geometry && prop.geometry.coordinates && prop.geometry.coordinates[0]) {
                const coords = prop.geometry.coordinates[0];
                layer = L.polygon(
                    coords.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]),
                    {
                        color,
                        fillColor: color,
                        fillOpacity: isSelected ? 0.45 : 0.2,
                        weight: isSelected ? 3 : 2,
                        dashArray: prop.status === 'pending' ? '6 4' : prop.status === 'disputed' ? '4 3' : undefined,
                    }
                );
            } else {
                // Fallback: show circle marker at Point location
                const [lng, lat] = prop.location.coordinates;
                const circleRadius = Math.sqrt(prop.area) / 111; // Rough conversion for display

                layer = L.circle([lat, lng], {
                    radius: circleRadius,
                    color,
                    fillColor: color,
                    fillOpacity: isSelected ? 0.45 : 0.2,
                    weight: isSelected ? 3 : 2,
                    dashArray: prop.status === 'pending' ? '6 4' : prop.status === 'disputed' ? '4 3' : undefined,
                });
            }

            layer.bindPopup(createPopupContent(prop, color), { maxWidth: 280 });

            layer.on('click', () => {
                if (onPropertyClick) onPropertyClick(prop);
            });

            layer.on('mouseover', () => {
                (layer as any).setStyle({ fillOpacity: isSelected ? 0.5 : 0.35, weight: isSelected ? 3 : 2.5 });
            });

            layer.on('mouseout', () => {
                (layer as any).setStyle({ fillOpacity: isSelected ? 0.45 : 0.2, weight: isSelected ? 3 : 2 });
            });

            layer.addTo(map);
            layersRef.current[propId] = layer;

            if (isSelected) {
                let centerLat = 18.5204;
                let centerLng = 73.8567;

                if (prop.geometry?.coordinates?.[0]) {
                    const coords = prop.geometry.coordinates[0];
                    centerLat = coords.reduce((s: number, p: number[]) => s + p[1], 0) / coords.length;
                    centerLng = coords.reduce((s: number, p: number[]) => s + p[0], 0) / coords.length;
                } else {
                    [centerLng, centerLat] = prop.location.coordinates;
                }
                
                map.flyTo([centerLat, centerLng], 15, { duration: 0.8 });
            }
        });
    }, [properties, selectedId, onPropertyClick, createPopupContent]);

    useEffect(() => {
        if (typeof window === 'undefined' || !containerRef.current) return;

        const initMap = async () => {
            const L = (await import('leaflet')).default;
            let drawPlugin;
            if (showDraw) drawPlugin = await import('leaflet-draw');

            // Fix marker icons
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            if (!mapRef.current) {
                const map = L.map(containerRef.current!, {
                    center,
                    zoom,
                    zoomControl: true,
                });

                mapRef.current = map;

                // OSM tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                }).addTo(map);

                // Draw control (admin only)
                if (showDraw && drawPlugin) {
                    const drawnItems = new L.FeatureGroup();
                    map.addLayer(drawnItems);

                    const drawControl = new (L.Control as any).Draw({
                        edit: { featureGroup: drawnItems },
                        draw: {
                            polygon: {
                                allowIntersection: false,
                                showArea: true,
                                shapeOptions: { color: '#63be7b', fillOpacity: 0.3 },
                            },
                            polyline: false, rectangle: false, circle: false, marker: false, circlemarker: false,
                        },
                    });
                    map.addControl(drawControl);

                    map.on((L as any).Draw.Event.CREATED, (e: any) => {
                        const layer = e.layer;
                        drawnItems.addLayer(layer);
                        if (onPolygonDrawn) {
                            const latlngs = layer.getLatLngs()[0] as any[];
                            const coords = latlngs.map((ll: any) => [ll.lng, ll.lat]);
                            coords.push(coords[0]); // close ring
                            onPolygonDrawn([coords]);
                        }
                    });
                }
            }

            renderLayers(L);
        };

        initMap();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                layersRef.current = {};
            }
        };
    }, []);

    // Re-render layers when properties or selectedId change
    useEffect(() => {
        const updateLayers = async () => {
            const L = (await import('leaflet')).default;
            renderLayers(L);
        };
        updateLayers();
    }, [renderLayers]);

    return (
        <div ref={containerRef} style={{
            width: '100%',
            height,
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-primary)',
        }} />
    );
}

