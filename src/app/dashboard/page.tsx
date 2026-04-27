'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, FileText, MapPin, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLandRegistry } from '@/contexts/LandRegistryContext';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <div style={{ height: 340 }} className="card">Loading map...</div>,
});

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { properties, loading, error } = useLandRegistry();

  const totalArea = properties.reduce((sum, property) => sum + property.area, 0);
  const stats = {
    total: properties.length,
    registered: properties.filter((property) => property.status === 'registered').length,
    pending: properties.filter((property) => property.status === 'pending').length,
    disputed: properties.filter((property) => property.status === 'disputed').length,
    owners: new Set(properties.map((property) => property.owner._id)).size,
    totalArea,
  };

  const recent = [...properties]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Admin Dashboard</h2>
          <p>
            {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Administrator'} - registry operations
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/register-property" className="btn btn-primary btn-sm">
            Register Property
          </Link>
          <Link href="/properties" className="btn btn-secondary btn-sm">
            View All
          </Link>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(239,68,68,0.35)' }}>
          <p style={{ color: 'var(--accent-red)' }}>{error}</p>
        </div>
      )}

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <Stat label="Total Parcels" value={String(stats.total)} icon={<FileText size={18} color="var(--accent-green)" />} />
        <Stat label="Registered" value={String(stats.registered)} icon={<CheckCircle size={18} color="var(--status-registered)" />} />
        <Stat label="Pending" value={String(stats.pending)} icon={<Clock size={18} color="var(--status-pending)" />} />
        <Stat label="Disputed" value={String(stats.disputed)} icon={<AlertTriangle size={18} color="var(--status-disputed)" />} />
        <Stat label="Total Area (m²)" value={stats.totalArea.toLocaleString()} icon={<MapPin size={18} color="var(--accent-blue)" />} />
        <Stat label="Owners" value={String(stats.owners)} icon={<Users size={18} color="var(--accent-purple)" />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-primary)' }}>
            <h4 style={{ color: 'var(--text-primary)' }}>Registry Map</h4>
          </div>
          <MapView properties={properties} height="340px" />
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={16} color="var(--accent-green)" />
            <h4 style={{ color: 'var(--text-primary)' }}>Recent Updates</h4>
          </div>
          {loading ? (
            <div style={{ padding: 18 }}>Loading...</div>
          ) : recent.length === 0 ? (
            <div style={{ padding: 18 }}>No properties available yet.</div>
          ) : (
            <div>
              {recent.map((property) => (
                <Link
                  key={property._id}
                  href={`/properties/${property._id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-primary)',
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{property.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{property.ownerName}</div>
                  </div>
                  <span className={`badge badge-${property.status}`}>{property.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
