'use client';

import { useState, useMemo } from 'react';
import { useProperties } from '@/hooks/useProperties';
import { useAuth } from '@/contexts/AuthContext';
import { Search, SlidersHorizontal, MapPin, ArrowUpRight, X, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/MapView'), {
    ssr: false,
    loading: () => <div style={{ height: '100%', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Loading map...</div>,
});

export default function PropertiesPage() {
    const { properties, loading, error, refetch } = useProperties({ 
        limit: 100,
        autoFetch: true 
    });
    const { isAdmin } = useAuth();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
    const [selectedId, setSelectedId] = useState<string | undefined>();
    const [view, setView] = useState<'split' | 'list'>('split');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const filtered = useMemo(() => {
        return properties.filter(p => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                p.title?.toLowerCase().includes(q) ||
                p.address?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.registryNumber?.toLowerCase().includes(q);
            const matchStatus = statusFilter === 'all' || p.status === statusFilter;
            const matchType = propertyTypeFilter === 'all' || p.propertyType === propertyTypeFilter;
            return matchSearch && matchStatus && matchType;
        });
    }, [properties, search, statusFilter, propertyTypeFilter]);

    const propertyTypes = ['all', ...Array.from(new Set(properties.map(p => p.propertyType).filter(Boolean)))];

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, marginBottom: 10 }}>Loading properties from database...</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Connecting to MongoDB</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: 20, textAlign: 'center' }}>
                <div style={{ color: '#dc2626' }}>
                    <div style={{ fontSize: 16, marginBottom: 10, fontWeight: 600 }}>Error Loading Properties</div>
                    <div style={{ fontSize: 13, marginBottom: 20, color: '#991b1b' }}>{error}</div>
                    <button 
                        onClick={handleRefresh}
                        style={{
                            padding: '8px 16px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 13
                        }}
                    >
                        Retry
                    </button>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
                    <div>Debugging tips:</div>
                    <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: 8 }}>
                        <li>✓ Check if MongoDB is running</li>
                        <li>✓ Verify MONGODB_URI in .env.local</li>
                        <li>✓ Run /api/seed to populate data</li>
                        <li>✓ Check /api/health for connection status</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h2>Properties Registry</h2>
                    <p>{filtered.length} of {properties.length} records from MongoDB</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        title="Refresh from MongoDB"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: 'var(--radius-md)',
                            padding: '8px 12px',
                            cursor: isRefreshing ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 13,
                            opacity: isRefreshing ? 0.6 : 1,
                        }}
                    >
                        <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <div className="tabs">
                        <button className={`tab-btn ${view === 'split' ? 'active' : ''}`} onClick={() => setView('split')}>Split View</button>
                        <button className={`tab-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List View</button>
                    </div>
                    {isAdmin && <Link href="/register-property" className="btn btn-primary btn-sm">+ Register</Link>}
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="search-bar">
                    <Search size={16} color="var(--text-muted)" />
                    <input
                        placeholder="Search by title, owner, parcel ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={14} /></button>}
                </div>
                <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">All Statuses</option>
                    <option value="registered">Registered</option>
                    <option value="pending">Pending</option>
                    <option value="disputed">Disputed</option>
                </select>
                <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={propertyTypeFilter} onChange={e => setPropertyTypeFilter(e.target.value)}>
                    {propertyTypes.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                    { s: 'registered', label: 'Registered' },
                    { s: 'pending', label: 'Pending (dashed)' },
                    { s: 'disputed', label: 'Disputed (dashed)' },
                ].map(l => (
                    <div key={l.s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                        <div className={`status-dot ${l.s}`} />
                        {l.label}
                    </div>
                ))}
            </div>

            {view === 'split' ? (
                <div className="split-view" style={{ minHeight: 520 }}>
                    {/* Map */}
                    <div style={{ height: 580, position: 'relative' }}>
                        <MapView
                            properties={filtered}
                            height="580px"
                            selectedId={selectedId}
                            onPropertyClick={p => setSelectedId(p._id || (p as any).id)}
                        />
                    </div>

                    {/* List */}
                    <div style={{ height: 580, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filtered.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon"><MapPin size={28} /></div>
                                <p>No properties match your filters</p>
                            </div>
                        ) : filtered.map(prop => (
                            <PropertyCard
                                key={prop._id}
                                property={prop}
                                selected={selectedId === (prop._id || (prop as any).id)}
                                onSelect={() => setSelectedId((prop._id || (prop as any).id) === selectedId ? undefined : (prop._id || (prop as any).id))}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Address</th>
                                <th>Type</th>
                                <th>Area (m²)</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(prop => (
                                <tr key={prop._id}>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{prop.title}</td>
                                    <td>{prop.address}</td>
                                    <td><span className="tag">{prop.propertyType}</span></td>
                                    <td>{prop.area?.toLocaleString()}</td>
                                    <td><span className={`badge badge-${prop.status}`}><div className={`status-dot ${prop.status}`} />{prop.status}</span></td>
                                    <td>{new Date(prop.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <Link href={`/properties/${prop._id}`} className="btn btn-ghost btn-sm btn-icon">
                                            <ArrowUpRight size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon"><MapPin size={28} /></div>
                            <p>No properties found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function PropertyCard({ property: p, selected, onSelect }: { property: any; selected: boolean; onSelect: () => void }) {
    return (
        <div
            onClick={onSelect}
            style={{
                background: selected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: `1px solid ${selected ? 'var(--border-accent)' : 'var(--border-primary)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'var(--transition)',
                boxShadow: selected ? 'var(--shadow-glow)' : 'none',
            }}
        >
            <div style={{ display: 'flex', align: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.title}</span>
                <span className={`badge badge-${p.status}`} style={{ fontSize: 10 }}>
                    <div className={`status-dot ${p.status}`} style={{ width: 6, height: 6 }} />{p.status}
                </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{p.address}</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                <span><MapPin size={11} style={{ display: 'inline' }} /> {p.propertyType}</span>
                <span>{p.area?.toLocaleString()} m²</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Created: {new Date(p.createdAt).toLocaleDateString()}</span>
                <Link
                    href={`/properties/${p._id}`}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, padding: '4px 8px', gap: 4 }}
                    onClick={e => e.stopPropagation()}
                >
                    Details <ArrowUpRight size={11} />
                </Link>
            </div>
        </div>
    );
}
