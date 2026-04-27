'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, FileText, MapPin, User } from 'lucide-react';
import type { LandRecord, PropertyApi } from '@/types';
import { toPropertyView } from '@/lib/propertyMapper';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <div className="card" style={{ height: 280 }}>Loading map...</div>,
});
import { useAuth } from '@/contexts/AuthContext';
import { useLandRegistry } from '@/contexts/LandRegistryContext';

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [property, setProperty] = useState<LandRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/properties/${id}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Property not found');
        const result = (await response.json()) as { success: boolean; data?: PropertyApi; error?: string };
        if (!result.success || !result.data) throw new Error(result.error || 'Failed to load property');
        setProperty(toPropertyView(result.data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const { isAdmin } = useAuth();
  const { updateProperty } = useLandRegistry();

  if (loading) {
    return <div className="empty-state"><p>Loading property details...</p></div>;
  }
  if (error || !property) {
    return (
      <div className="empty-state">
        <h3 style={{ color: 'var(--text-primary)' }}>Property not found</h3>
        <p>{error || 'The requested property could not be loaded.'}</p>
        <Link href="/properties" className="btn btn-secondary">Back to properties</Link>
      </div>
    );
  }

  const handleApprove = async () => {
    try {
      const updated = await updateProperty(property._id, { status: 'registered' });
      setProperty(toPropertyView(updated as any));
    } catch (e) {
      alert('Failed to approve');
    }
  };

  return (
    <div>
      <Link href="/properties" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
        <ArrowLeft size={14} /> Back to properties
      </Link>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>{property.title}</h2>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} color="var(--accent-green)" />
              {property.address}
            </p>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <span className={`badge badge-${property.status}`}>{property.status}</span>
            {isAdmin && property.status === 'pending' && (
              <button onClick={handleApprove} className="btn btn-primary btn-sm mt-2">
                Approve Property
              </button>
            )}
            <div style={{ marginTop: 2, color: 'var(--text-muted)' }}>{property.propertyType}</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 16 }}>
        <div className="card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--text-primary)' }}>
            <User size={16} /> Owner
          </h4>
          <div className="info-row">
            <span className="info-label">Name</span>
            <span className="info-value">{property.ownerName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{property.ownerEmail}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Role</span>
            <span className="info-value">{property.owner.role}</span>
          </div>
        </div>

        <div className="card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--text-primary)' }}>
            <FileText size={16} /> Property info
          </h4>
          <div className="info-row">
            <span className="info-label">Registry #</span>
            <span className="info-value">{property.registryNumber || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Survey #</span>
            <span className="info-value">{property.surveyNumber || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Area</span>
            <span className="info-value">{property.area.toLocaleString()} m²</span>
          </div>
          <div className="info-row">
            <span className="info-label">Created</span>
            <span className="info-value">{new Date(property.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Updated</span>
            <span className="info-value">{new Date(property.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)' }}>
          <h4 style={{ color: 'var(--text-primary)' }}>Location</h4>
        </div>
        <MapView properties={[property]} height="280px" selectedId={property._id} />
      </div>
    </div>
  );
}
