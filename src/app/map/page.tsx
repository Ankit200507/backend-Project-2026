'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import { useLandRegistry } from '@/contexts/LandRegistryContext';
import { LandRecord } from '@/types';
import { Search, X, Layers, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const MapView = dynamic(() => import('@/components/map/MapView'), {
    ssr: false,
    loading: () => (
        <div style={{ height: '100%', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            <div style={{ textAlign: 'center' }}>
                <Layers size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                <div>Loading OpenStreetMap...</div>
            </div>
        </div>
    ),
});

export default function MapPage() {
    const { properties } = useLandRegistry();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedProperty, setSelectedProperty] = useState<LandRecord | null>(null);

    const filtered = useMemo(() => {
        return properties.filter(p => {
            const q = search.toLowerCase();
            const matchSearch = !q || p.ownerName.toLowerCase().includes(q) || p.titleNumber.toLowerCase().includes(q) || p.district.toLowerCase().includes(q);
            const matchStatus = statusFilter === 'all' || p.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [properties, search, statusFilter]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--navbar-height) - 64px)' }}>
            <div className="page-header" style={{ marginBottom: 16 }}>
                <div className="page-header-left">
                    <h2>Map Explorer</h2>
                    <p>Interactive geofenced land registry on OpenStreetMaps — {filtered.length} parcels shown</p>
                </div>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="search-bar">
                    <Search size={15} color="var(--text-muted)" />
                    <input placeholder="Search owner, title, area..." value={search} onChange={e => setSearch(e.target.value)} />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={13} /></button>}
                </div>
                <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">All Statuses</option>
                    <option value="registered">Registered</option>
                    <option value="pending">Pending</option>
                    <option value="disputed">Disputed</option>
                </select>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 14, marginLeft: 'auto', flexWrap: 'wrap' }}>
                    {[
                        { s: 'registered', label: 'Registered' },
                        { s: 'pending', label: 'Pending' },
                        { s: 'disputed', label: 'Disputed' },
                    ].map(l => (
                        <div key={l.s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                            <div className={`status-dot ${l.s}`} />
                            {l.label}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: selectedProperty ? '1fr 340px' : '1fr', gap: 16, minHeight: 0 }}>
                {/* Map fills the area */}
                <div style={{ position: 'relative', minHeight: 500 }}>
                    <MapView
                        properties={filtered}
                        height="100%"
                        selectedId={selectedProperty?.id}
                        onPropertyClick={p => setSelectedProperty(p)}
                    />
                    {/* Info overlay */}
                    <div style={{
                        position: 'absolute', bottom: 16, left: 16, zIndex: 500,
                        background: 'rgba(10,12,16,0.85)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        fontSize: 12, color: 'var(--text-muted)',
                        pointerEvents: 'none',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <div className="status-dot registered" style={{ width: 6 }} />
                            Click any polygon to view details
                        </div>
                        <div style={{ color: 'var(--accent-green)' }}>Pune, Maharashtra — OSM Tiles</div>
                    </div>
                </div>

                {/* Side panel for selected property */}
                {selectedProperty && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ color: 'var(--text-primary)', fontSize: 14 }}>Selected Parcel</h4>
                                <button onClick={() => setSelectedProperty(null)} className="btn btn-ghost btn-icon btn-sm">
                                    <X size={14} />
                                </button>
                            </div>
                            <div style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <span className={`badge badge-${selectedProperty.status}`}>
                                        <div className={`status-dot ${selectedProperty.status}`} style={{ width: 6, height: 6 }} />
                                        {selectedProperty.status}
                                    </span>
                                    <span className="tag" style={{ fontSize: 11 }}>{selectedProperty.landUse}</span>
                                </div>
                                <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                                    {selectedProperty.titleNumber}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                                    {selectedProperty.address}
                                </div>

                                <div>
                                    {[
                                        { label: 'Owner', value: selectedProperty.ownerName },
                                        { label: 'Area', value: `${selectedProperty.area.toLocaleString()} m²` },
                                        { label: 'Parcel ID', value: selectedProperty.parcelId },
                                        { label: 'District', value: selectedProperty.district },
                                        { label: 'Registered', value: selectedProperty.registeredDate },
                                    ].map(r => (
                                        <div key={r.label} className="info-row" style={{ paddingTop: 8, paddingBottom: 8 }}>
                                            <span className="info-label" style={{ fontSize: 12 }}>{r.label}</span>
                                            <span className="info-value" style={{ fontSize: 12 }}>{r.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: 12 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Block Hash</div>
                                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--accent-green)', background: 'var(--accent-green-dim)', padding: '6px 10px', borderRadius: 6, wordBreak: 'break-all', border: '1px solid var(--border-accent)' }}>
                                        {selectedProperty.blockHash.slice(0, 32)}…
                                    </div>
                                </div>

                                <Link href={`/properties/${selectedProperty.id}`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}>
                                    View Full Record <ExternalLink size={13} />
                                </Link>
                            </div>
                        </div>

                        {/* Other properties list */}
                        <div className="card" style={{ padding: '14px 16px' }}>
                            <h5 style={{ color: 'var(--text-secondary)', marginBottom: 10, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                                All Parcels ({filtered.length})
                            </h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {filtered.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedProperty(p)}
                                        style={{
                                            background: selectedProperty?.id === p.id ? 'var(--accent-green-dim)' : 'transparent',
                                            border: `1px solid ${selectedProperty?.id === p.id ? 'var(--border-accent)' : 'transparent'}`,
                                            borderRadius: 8,
                                            padding: '8px 10px',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            transition: 'var(--transition)',
                                        }}
                                    >
                                        <div className={`status-dot ${p.status}`} style={{ flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.titleNumber}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.ownerName}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
