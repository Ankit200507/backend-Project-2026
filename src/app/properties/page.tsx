'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Search, X, RefreshCw, ArrowUpRight, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLandRegistry } from '@/contexts/LandRegistryContext';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <div className="card" style={{ height: 560 }}>Loading map...</div>,
});

export default function PropertiesPage() {
  const { isAdmin } = useAuth();
  const { properties, loading, error, refreshProperties } = useLandRegistry();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'registered' | 'pending' | 'disputed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'residential' | 'commercial' | 'agricultural' | 'industrial'>('all');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [view, setView] = useState<'split' | 'table'>('split');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return properties.filter((property) => {
      const matchSearch =
        !query ||
        property.title.toLowerCase().includes(query) ||
        property.address.toLowerCase().includes(query) ||
        property.ownerName.toLowerCase().includes(query) ||
        property.registryNumber?.toLowerCase().includes(query);
      const matchStatus = statusFilter === 'all' || property.status === statusFilter;
      const matchType = typeFilter === 'all' || property.propertyType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [properties, search, statusFilter, typeFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProperties();
    setRefreshing(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Properties</h2>
          <p>{filtered.length} of {properties.length} records</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" type="button" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <div className="tabs">
            <button className={`tab-btn ${view === 'split' ? 'active' : ''}`} onClick={() => setView('split')}>
              Split
            </button>
            <button className={`tab-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')}>
              Table
            </button>
          </div>
          {isAdmin && (
            <Link href="/register-property" className="btn btn-primary btn-sm">
              Register
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.35)', marginBottom: 12 }}>
          <p style={{ color: 'var(--accent-red)' }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar">
          <Search size={15} color="var(--text-muted)" />
          <input placeholder="Search title, owner, address..." value={search} onChange={(event) => setSearch(event.target.value)} />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
              <X size={13} />
            </button>
          )}
        </div>
        <select className="form-select" style={{ width: 170 }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
          <option value="all">All statuses</option>
          <option value="registered">Registered</option>
          <option value="pending">Pending</option>
          <option value="disputed">Disputed</option>
        </select>
        <select className="form-select" style={{ width: 190 }} value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}>
          <option value="all">All property types</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="agricultural">Agricultural</option>
          <option value="industrial">Industrial</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Loading properties...</p>
        </div>
      ) : view === 'split' ? (
        <div className="split-view" style={{ minHeight: 560 }}>
          <MapView properties={filtered} height="560px" selectedId={selectedId} onPropertyClick={(property) => setSelectedId(property._id)} />
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 560 }}>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><MapPin size={26} /></div>
                <p>No properties found</p>
              </div>
            ) : (
              filtered.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  selected={selectedId === property._id}
                  onSelect={() => setSelectedId(selectedId === property._id ? undefined : property._id)}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Owner</th>
                <th>Type</th>
                <th>Area (m²)</th>
                <th>Status</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((property) => (
                <tr key={property._id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{property.title}</td>
                  <td>{property.ownerName}</td>
                  <td>{property.propertyType}</td>
                  <td>{property.area.toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${property.status}`}>{property.status}</span>
                  </td>
                  <td>{new Date(property.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/properties/${property._id}`} className="btn btn-ghost btn-sm btn-icon">
                      <ArrowUpRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PropertyCard({
  property,
  selected,
  onSelect,
}: {
  property: {
    _id: string;
    title: string;
    ownerName: string;
    address: string;
    area: number;
    propertyType: string;
    status: 'registered' | 'pending' | 'disputed';
    updatedAt: string;
  };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect();
      }}
      style={{
        background: selected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: `1px solid ${selected ? 'var(--border-accent)' : 'var(--border-primary)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <h4 style={{ color: 'var(--text-primary)' }}>{property.title}</h4>
        <span className={`badge badge-${property.status}`}>{property.status}</span>
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>{property.ownerName}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 6 }}>{property.address}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
        <span>{property.propertyType}</span>
        <span>{property.area.toLocaleString()} m²</span>
      </div>
      <Link href={`/properties/${property._id}`} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>
        Details <ArrowUpRight size={12} />
      </Link>
    </div>
  );
}

