'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLandRegistry } from '@/contexts/LandRegistryContext';
import { getStatsData } from '@/lib/mockData';
import {
    FileText, CheckCircle, Clock, AlertTriangle,
    MapPin, Users, TrendingUp, Activity, ArrowUpRight, Shield, Map
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/MapView'), {
    ssr: false,
    loading: () => (
        <div style={{ height: '100%', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-primary)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading map...</div>
        </div>
    ),
});

export default function DashboardPage() {
    const { currentUser, isAdmin } = useAuth();
    const { properties } = useLandRegistry();
    const stats = getStatsData();

    const recentProperties = [...properties].sort((a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    ).slice(0, 5);

    const statCards = [
        {
            label: 'Total Parcels',
            value: stats.totalParcels,
            icon: <FileText size={20} color="var(--accent-green)" />,
            color: 'var(--accent-green)',
            glow: 'var(--accent-green-glow)',
            bg: 'var(--accent-green-dim)',
        },
        {
            label: 'Registered',
            value: stats.registered,
            icon: <CheckCircle size={20} color="#22c55e" />,
            color: '#22c55e',
            glow: 'rgba(34,197,94,0.3)',
            bg: 'rgba(34,197,94,0.1)',
        },
        {
            label: 'Pending',
            value: stats.pending,
            icon: <Clock size={20} color="var(--accent-amber)" />,
            color: 'var(--accent-amber)',
            glow: 'rgba(245,158,11,0.3)',
            bg: 'rgba(245,158,11,0.1)',
        },
        {
            label: 'Disputed',
            value: stats.disputed,
            icon: <AlertTriangle size={20} color="var(--accent-red)" />,
            color: 'var(--accent-red)',
            glow: 'rgba(239,68,68,0.3)',
            bg: 'rgba(239,68,68,0.1)',
        },
        {
            label: 'Total Area (m²)',
            value: stats.totalArea.toLocaleString(),
            icon: <MapPin size={20} color="var(--accent-blue)" />,
            color: 'var(--accent-blue)',
            glow: 'var(--accent-blue-dim)',
            bg: 'var(--accent-blue-dim)',
        },
        {
            label: 'Landowners',
            value: stats.totalOwners,
            icon: <Users size={20} color="var(--accent-purple)" />,
            color: 'var(--accent-purple)',
            glow: 'rgba(167,139,250,0.3)',
            bg: 'var(--accent-purple-dim)',
        },
    ];

    return (
        <div>
            {/* Welcome Banner */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(99,190,123,0.08) 0%, rgba(78,154,241,0.05) 100%)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-xl)',
                padding: '28px 32px',
                marginBottom: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                flexWrap: 'wrap',
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <h2 style={{ fontSize: 22, color: 'var(--text-primary)' }}>
                            Welcome back, {currentUser.name.split(' ')[0]} 👋
                        </h2>
                        <span className={`badge badge-${currentUser.role}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {isAdmin && <Shield size={10} />}
                            {currentUser.role.toUpperCase()}
                        </span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                        {isAdmin
                            ? 'You have authority-level access. Register and manage all land records.'
                            : 'Browse properties and verify your land titles on the registry.'
                        }
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {isAdmin && (
                        <Link href="/register-property" className="btn btn-primary">
                            Register New Parcel
                        </Link>
                    )}
                    <Link href="/map" className="btn btn-secondary">
                        <Map size={16} /> Open Map
                    </Link>
                </div>
            </div>

            {/* Stats grid */}
            <div className="stats-grid" style={{ marginBottom: 28 }}>
                {statCards.map(s => (
                    <div key={s.label} className="stat-card" style={{
                        '--accent-color': s.bg,
                        '--accent-glow': s.glow,
                    } as React.CSSProperties}>
                        <div className="stat-icon" style={{ background: s.bg }}>
                            {s.icon}
                        </div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Map + Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 24 }}>
                {/* Mini map */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h4 style={{ color: 'var(--text-primary)', marginBottom: 2 }}>Property Map Overview</h4>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>All geofenced parcels — Pune, Maharashtra</p>
                        </div>
                        <Link href="/map" className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
                            Full Map <ArrowUpRight size={13} />
                        </Link>
                    </div>
                    <div style={{ height: 360 }}>
                        <MapView properties={properties} height="360px" />
                    </div>
                </div>

                {/* Recent activity */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Activity size={16} color="var(--accent-green)" />
                        <h4 style={{ color: 'var(--text-primary)' }}>Recent Transactions</h4>
                    </div>
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        {recentProperties.map((prop, i) => (
                            <Link key={prop.id} href={`/properties/${prop.id}`}
                                style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 12,
                                    padding: '14px 18px',
                                    borderBottom: i < recentProperties.length - 1 ? '1px solid var(--border-primary)' : 'none',
                                    textDecoration: 'none',
                                    transition: 'var(--transition)',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-glass)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <div className={`status-dot ${prop.status}`} style={{ marginTop: 6, flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {prop.titleNumber}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                        {prop.ownerName} · {prop.area.toLocaleString()} m²
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                                        {prop.lastUpdated}
                                    </div>
                                </div>
                                <span className={`badge badge-${prop.status}`} style={{ fontSize: 10, flexShrink: 0 }}>
                                    {prop.status}
                                </span>
                            </Link>
                        ))}
                    </div>
                    <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-primary)' }}>
                        <Link href="/properties" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                            View All Properties →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Admin quick actions */}
            {isAdmin && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(167,139,250,0.06), rgba(99,190,123,0.04))',
                    border: '1px solid rgba(167,139,250,0.15)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 24,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Shield size={18} color="var(--accent-purple)" />
                        <h4 style={{ color: 'var(--text-primary)' }}>Authority Actions</h4>
                        <span className="badge badge-admin">Admin Only</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <Link href="/register-property" className="btn btn-primary btn-sm">Register Property</Link>
                        <Link href="/properties" className="btn btn-secondary btn-sm">Manage Records</Link>
                        <Link href="/map" className="btn btn-secondary btn-sm">Map View</Link>
                    </div>
                </div>
            )}
        </div>
    );
}
