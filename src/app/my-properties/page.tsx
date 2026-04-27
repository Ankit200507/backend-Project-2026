'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { CheckCircle, Clock, AlertCircle, MapPin, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLandRegistry } from '@/contexts/LandRegistryContext';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <div className="card" style={{ height: 280 }}>Loading map...</div>,
});

const StatusIcon = ({ status }: { status: 'registered' | 'pending' | 'disputed' }) => {
  if (status === 'registered') return <CheckCircle size={14} color="var(--status-registered)" />;
  if (status === 'pending') return <Clock size={14} color="var(--status-pending)" />;
  return <AlertCircle size={14} color="var(--status-disputed)" />;
};

export default function MyPropertiesPage() {
  const { currentUser, isAdmin } = useAuth();
  const { properties } = useLandRegistry();

  const myProperties = isAdmin
    ? properties
    : properties.filter((property) => property.ownerEmail.toLowerCase() === currentUser?.email.toLowerCase());

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>{isAdmin ? 'All Properties' : 'My Properties'}</h2>
          <p>{myProperties.length} records</p>
        </div>
        {isAdmin && (
          <Link href="/register-property" className="btn btn-primary btn-sm">
            Register Property
          </Link>
        )}
      </div>

      {myProperties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><MapPin size={28} /></div>
          <h3 style={{ color: 'var(--text-primary)' }}>No properties found</h3>
          <p>No records are available for this account.</p>
          <Link href="/properties" className="btn btn-secondary" style={{ marginTop: 8 }}>
            Browse registry
          </Link>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)' }}>
              <h4 style={{ color: 'var(--text-primary)' }}>Property Map</h4>
            </div>
            <MapView properties={myProperties} height="280px" />
          </div>

          <div className="grid-2" style={{ gap: 16 }}>
            {myProperties.map((property) => (
              <div key={property._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)' }}>{property.title}</h4>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{property.registryNumber || 'No registry number'}</div>
                  </div>
                  <span className={`badge badge-${property.status}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <StatusIcon status={property.status} />
                    {property.status}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Owner</span>
                  <span className="info-value">{property.ownerName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Address</span>
                  <span className="info-value">{property.address}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Area</span>
                  <span className="info-value">{property.area.toLocaleString()} m²</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Updated</span>
                  <span className="info-value">{new Date(property.updatedAt).toLocaleDateString()}</span>
                </div>
                <Link href={`/properties/${property._id}`} className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
                  View details <ArrowUpRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

