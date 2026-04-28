'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLandRegistry } from '@/contexts/LandRegistryContext';
import type { PropertyCreateInput, PropertyStatus, PropertyType } from '@/types';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <div className="card" style={{ height: 400 }}>Loading map...</div>,
});

export default function RegisterPropertyPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { addProperty } = useLandRegistry();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    area: '',
    propertyType: 'residential' as PropertyType,
    status: 'pending' as PropertyStatus,
    registryNumber: '',
    surveyNumber: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerAadhar: '',
    latitude: '',
    longitude: '',
  });

  const [geometry, setGeometry] = useState<number[][][] | null>(null);
  const [searchingUser, setSearchingUser] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handlePolygonDrawn = useCallback((coords: number[][][], area?: number) => {
    setGeometry(coords);
    if (coords.length > 0 && coords[0].length > 0) {
      const ring = coords[0];
      const lngs = ring.map(p => p[0]);
      const lats = ring.map(p => p[1]);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      
      const centroidLng = minLng + (maxLng - minLng) / 2;
      const centroidLat = minLat + (maxLat - minLat) / 2;

      setForm(prev => ({
        ...prev,
        longitude: centroidLng.toFixed(6),
        latitude: centroidLat.toFixed(6),
        ...(area && area > 0 ? { area: Math.round(area).toString() } : {})
      }));
    }
  }, []);

  const searchUserByAadhar = async () => {
    if (!form.ownerAadhar || form.ownerAadhar.length !== 12) {
      setSearchError('Please enter a 12-digit Aadhar number');
      return;
    }
    setSearchingUser(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/users/search?aadharNumber=${form.ownerAadhar}`);
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({
          ...prev,
          ownerFirstName: data.data.firstName,
          ownerLastName: data.data.lastName || '',
          ownerEmail: data.data.email,
        }));
      } else {
        setSearchError(data.error);
      }
    } catch (err) {
      setSearchError('Failed to search user');
    } finally {
      setSearchingUser(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="empty-state">
        <h3 style={{ color: 'var(--text-primary)' }}>Admin access required</h3>
        <p>Only admins can register new properties.</p>
        <Link href="/my-properties" className="btn btn-secondary">
          Back to properties
        </Link>
      </div>
    );
  }

  const updateField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (!geometry || geometry.length === 0) {
        throw new Error('Please draw the property boundary on the map');
      }

      const latitude = Number(form.latitude);
      const longitude = Number(form.longitude);
      const area = Number(form.area);
      if (Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(area)) {
        throw new Error('Area must be a valid number and boundary must be drawn on map');
      }

      const payload: PropertyCreateInput = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        address: form.address.trim(),
        area,
        propertyType: form.propertyType,
        status: form.status,
        registryNumber: form.registryNumber.trim() || undefined,
        surveyNumber: form.surveyNumber.trim() || undefined,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        owner: {
          email: form.ownerEmail.trim(),
          firstName: form.ownerFirstName.trim(),
          lastName: form.ownerLastName.trim(),
        },
        geometry: {
          type: 'Polygon',
          coordinates: geometry,
        },
      };

      const created = await addProperty(payload);
      router.push(`/properties/${created._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create property');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link href="/properties" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
        <ArrowLeft size={14} />
        Back to properties
      </Link>

      <div className="page-header">
        <div className="page-header-left">
          <h2>Register Property</h2>
          <p>Create a new record linked to an owner profile.</p>
        </div>
      </div>

      <div className="split-view">
        <div className="card">
          <div className="grid-2" style={{ gap: 14 }}>
            <Field label="Title" value={form.title} onChange={(value) => updateField('title', value)} />
            <Field label="Address" value={form.address} onChange={(value) => updateField('address', value)} />
            <Field label="Area (m²)" value={form.area} onChange={(value) => updateField('area', value)} />

            <div className="form-group">
              <label className="form-label">Property type</label>
              <select className="form-select" value={form.propertyType} onChange={(event) => updateField('propertyType', event.target.value)}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="agricultural">Agricultural</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                <option value="pending">Pending</option>
                <option value="registered">Registered</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }} className="form-group">
              <label className="form-label">Search Owner by Aadhar</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input 
                  className="form-input" 
                  style={{ flex: 1 }}
                  placeholder="12-digit Aadhar Number"
                  value={form.ownerAadhar} 
                  onChange={(e) => updateField('ownerAadhar', e.target.value)} 
                />
                <button type="button" className="btn btn-secondary" onClick={searchUserByAadhar} disabled={searchingUser}>
                  {searchingUser ? 'Searching...' : 'Search'}
                </button>
              </div>
              {searchError && <p style={{ color: 'var(--accent-red)', fontSize: '0.875rem', marginTop: 4 }}>{searchError}</p>}
            </div>

            <Field label="Registry number" value={form.registryNumber} onChange={(value) => updateField('registryNumber', value)} />
            <Field label="Survey number" value={form.surveyNumber} onChange={(value) => updateField('surveyNumber', value)} />

            <Field label="Owner first name" value={form.ownerFirstName} onChange={(value) => updateField('ownerFirstName', value)} />
            <Field label="Owner last name" value={form.ownerLastName} onChange={(value) => updateField('ownerLastName', value)} />
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Owner email" value={form.ownerEmail} onChange={(value) => updateField('ownerEmail', value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Description</label>
            <textarea className="form-input" value={form.description} onChange={(event) => updateField('description', event.target.value)} />
          </div>

          {error && (
            <div className="card" style={{ marginTop: 12, borderColor: 'rgba(239,68,68,0.35)' }}>
              <p style={{ color: 'var(--accent-red)' }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary" type="button" onClick={onSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save property'}
            </button>
            <Link href="/properties" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-primary)' }}>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>Define Property Area</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Use the polygon tool to highlight and mark the land area on the map.</p>
          </div>
          <div style={{ flex: 1 }}>
            <MapView 
              properties={[]} 
              showDraw={true} 
              onPolygonDrawn={handlePolygonDrawn}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

