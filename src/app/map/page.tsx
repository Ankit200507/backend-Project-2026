'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useLandRegistry } from '@/contexts/LandRegistryContext';
import type { LandRecord } from '@/types';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <div className="card" style={{ height: 520 }}>Loading map...</div>,
});

export default function MapPage() {
  const { properties, loading, error } = useLandRegistry();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'registered' | 'pending' | 'disputed'>('all');
  const [selectedProperty, setSelectedProperty] = useState<LandRecord | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return properties.filter((property) => {
      const matchSearch =
        !q ||
        property.title.toLowerCase().includes(q) ||
        property.ownerName.toLowerCase().includes(q) ||
        property.registryNumber?.toLowerCase().includes(q) ||
        property.address.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || property.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [properties, search, statusFilter]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Map Explorer</h2>
          <p>{filtered.length} parcels shown</p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(239,68,68,0.35)' }}>
          <p style={{ color: 'var(--accent-red)' }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar">
          <Search size={15} color="var(--text-muted)" />
          <input placeholder="Search title, owner, registry..." value={search} onChange={(event) => setSearch(event.target.value)} />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
              <X size={13} />
            </button>
          )}
        </div>
        <select className="form-select" style={{ width: 180 }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
          <option value="all">All statuses</option>
          <option value="registered">Registered</option>
          <option value="pending">Pending</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        <div style={{ minHeight: 520 }}>
          <MapView
            properties={filtered}
            height="520px"
            selectedId={selectedProperty?.id}
            onPropertyClick={(property) => setSelectedProperty(property)}
          />
        </div>
        <div className="card" style={{ minHeight: 520, overflow: 'auto' }}>
          {loading ? (
            <p>Loading records...</p>
          ) : selectedProperty ? (
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>{selectedProperty.title}</h4>
              <div className="info-row">
                <span className="info-label">Owner</span>
                <span className="info-value">{selectedProperty.ownerName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Registry #</span>
                <span className="info-value">{selectedProperty.registryNumber || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Area</span>
                <span className="info-value">{selectedProperty.area.toLocaleString()} m²</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status</span>
                <span className={`badge badge-${selectedProperty.status}`}>{selectedProperty.status}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Address</span>
                <span className="info-value">{selectedProperty.address}</span>
              </div>
              <Link href={`/properties/${selectedProperty._id}`} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                View full record
              </Link>
            </div>
          ) : (
            <p>Select a parcel on the map to see details.</p>
          )}
        </div>
      </div>
    </div>
  );
}

