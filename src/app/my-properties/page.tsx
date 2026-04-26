'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLandRegistry } from '@/contexts/LandRegistryContext';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Building2, MapPin, Hash, Calendar, ArrowUpRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const MapView = dynamic(() => import('@/components/map/MapView'), {
    ssr: false,
    loading: () => <div style={{ height: 260, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Loading map...</div>,
});

const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'registered') return <CheckCircle size={14} color="var(--status-registered)" />;
    if (status === 'pending') return <Clock size={14} color="var(--status-pending)" />;
    return <AlertCircle size={14} color="var(--status-disputed)" />;
};

export default function MyPropertiesPage() {
    const { currentUser, isAdmin } = useAuth();
    const { properties } = useLandRegistry();

    const myProperties = isAdmin
        ? properties // Admin sees everything
        : properties.filter(p => p.ownerEmail === currentUser.email);

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h2>{isAdmin ? 'All Properties (Admin View)' : 'My Properties'}</h2>
                    <p>
                        {isAdmin
                            ? `Viewing all ${myProperties.length} registered parcels as Land Registry Authority`
                            : myProperties.length > 0
                                ? `${myProperties.length} land title${myProperties.length > 1 ? 's' : ''} registered under ${currentUser.name}`
                                : `No properties found for ${currentUser.name}`
                        }
                    </p>
                </div>
                {isAdmin && (
                    <Link href="/register-property" className="btn btn-primary">Register New Property</Link>
                )}
            </div>

            {/* User info card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(99,190,123,0.06), rgba(78,154,241,0.04))',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
            }}>
                <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: isAdmin ? 'var(--accent-purple-dim)' : 'var(--accent-blue-dim)',
                    border: `2px solid ${isAdmin ? 'var(--accent-purple)' : 'var(--accent-blue)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 700, color: isAdmin ? 'var(--accent-purple)' : 'var(--accent-blue)',
                    flexShrink: 0,
                }}>
                    {currentUser.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{currentUser.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0' }}>{currentUser.email}</div>
                    <span className={`badge badge-${currentUser.role}`}>{currentUser.role.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                    {[
                        { label: 'Total Parcels', value: myProperties.length },
                        { label: 'Registered', value: myProperties.filter(p => p.status === 'registered').length },
                        { label: 'Pending', value: myProperties.filter(p => p.status === 'pending').length },
                        { label: 'Disputed', value: myProperties.filter(p => p.status === 'disputed').length },
                    ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {myProperties.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><Building2 size={28} /></div>
                    <h3 style={{ color: 'var(--text-primary)' }}>No Properties Found</h3>
                    <p>No land titles are registered under your account in the registry.</p>
                    <Link href="/properties" className="btn btn-secondary" style={{ marginTop: 12 }}>Browse Registry</Link>
                </div>
            ) : (
                <>
                    {/* Map showing all user properties */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MapPin size={16} color="var(--accent-green)" />
                            <h4 style={{ color: 'var(--text-primary)' }}>Your Parcels on the Map</h4>
                            <span className="tag" style={{ marginLeft: 'auto', fontSize: 11 }}>OpenStreetMaps</span>
                        </div>
                        <MapView properties={myProperties} height="260px" />
                    </div>

                    {/* Properties grid */}
                    <div className="grid-2" style={{ gap: 16 }}>
                        {myProperties.map(prop => (
                            <div key={prop.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {/* Title row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                    <div>
                                        <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                            {prop.titleNumber}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{prop.parcelId}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        <span className={`badge badge-${prop.status}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <StatusIcon status={prop.status} />
                                            {prop.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="divider" style={{ margin: 0 }} />

                                {/* Info rows */}
                                <div>
                                    {[
                                        { label: 'Address', value: prop.address, icon: <MapPin size={12} /> },
                                        { label: 'Area', value: `${prop.area.toLocaleString()} m²`, icon: null },
                                        { label: 'Land Use', value: prop.landUse, icon: null },
                                        { label: 'Registered', value: prop.registeredDate, icon: <Calendar size={12} /> },
                                    ].map(r => (
                                        <div key={r.label} className="info-row" style={{ paddingTop: 7, paddingBottom: 7 }}>
                                            <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                                                {r.icon}{r.label}
                                            </span>
                                            <span className="info-value" style={{ fontSize: 12 }}>{r.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Hash */}
                                <div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Hash size={10} /> Blockchain Hash
                                    </div>
                                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--accent-green)', background: 'var(--accent-green-dim)', padding: '6px 10px', borderRadius: 6, wordBreak: 'break-all', border: '1px solid var(--border-accent)' }}>
                                        {prop.blockHash.slice(0, 40)}…
                                    </div>
                                </div>

                                <Link href={`/properties/${prop.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: 'auto', justifyContent: 'center', gap: 6 }}>
                                    View Full Record <ArrowUpRight size={13} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
