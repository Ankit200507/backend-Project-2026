'use client';

import { useState, useCallback } from 'react';
import { useLandRegistry } from '@/contexts/LandRegistryContext';
import { useAuth } from '@/contexts/AuthContext';
import { LandRecord, Property } from '@/types';
import { ArrowLeft, Info, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/MapView'), {
    ssr: false,
    loading: () => <div style={{ height: 400, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading map...</div>,
});

const LAND_USES = ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Mixed Use', 'Institutional', 'Open Space'];
const STATUSES = ['registered', 'pending', 'disputed'];

function generateHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
}

export default function RegisterPropertyPage() {
    const { isAdmin } = useAuth();
    const { addProperty, properties } = useLandRegistry();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [drawnCoords, setDrawnCoords] = useState<number[][][] | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [newPropId, setNewPropId] = useState('');

    const [form, setForm] = useState({
        ownerName: '',
        ownerNID: '',
        ownerEmail: '',
        address: '',
        district: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        landUse: 'Residential',
        status: 'registered' as 'registered' | 'pending' | 'disputed',
        description: '',
    });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePolygonDrawn = useCallback((coords: number[][][]) => {
        setDrawnCoords(coords);
    }, []);

    const computeCentroid = (coords: number[][][]): { lat: number; lng: number } => {
        const pts = coords[0];
        const lat = pts.reduce((s, p) => s + p[1], 0) / pts.length;
        const lng = pts.reduce((s, p) => s + p[0], 0) / pts.length;
        return { lat, lng };
    };

    const computeAreaApprox = (coords: number[][][]): number => {
        // Rough area using shoelace formula scaled for lat/lng
        const pts = coords[0];
        let area = 0;
        for (let i = 0; i < pts.length - 1; i++) {
            area += pts[i][0] * pts[i + 1][1];
            area -= pts[i + 1][0] * pts[i][1];
        }
        return Math.abs(area / 2) * 111319 * 111319 * Math.cos((pts[0][1] * Math.PI) / 180) | 0;
    };

    const handleSubmit = async () => {
        if (!drawnCoords) return;
        
        try {
            const centroid = computeCentroid(drawnCoords);
            const area = computeAreaApprox(drawnCoords);
            const idxStr = String(properties.length + 1).padStart(3, '0');
            const registryNumber = `TL-MH-2024-${idxStr}`;
            const surveyNumber = `MH-${form.district.toUpperCase().slice(0, 4)}-${idxStr}-NEW`;

            // Create property data in the format expected by the backend
            // The context will handle conversion to/from display format
            const newProp: LandRecord = {
                _id: '', // Will be set by backend
                title: form.ownerName, // Use owner name as title for now
                description: form.description,
                address: form.address,
                location: {
                    type: 'Point',
                    coordinates: [centroid.lng, centroid.lat],
                },
                area,
                propertyType: (form.landUse.toLowerCase() as 'residential' | 'commercial' | 'agricultural' | 'industrial'),
                owner: form.ownerEmail, // Will be used to look up user
                registryNumber,
                surveyNumber,
                status: form.status,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Additional frontend-only fields (won't be persisted to DB)
                ownerName: form.ownerName,
                ownerNID: form.ownerNID,
                ownerEmail: form.ownerEmail,
                district: form.district,
                state: form.state,
                country: form.country,
                geometry: { type: 'Polygon', coordinates: drawnCoords },
                centroid,
            };

            await addProperty(newProp);
            setNewPropId(registryNumber); // Use registry number as ID for display
            setSubmitted(true);
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Failed to register property';
            alert(`Error: ${errMsg}`);
            console.error('Submit error:', err);
        }
    };

    if (!isAdmin) {
        return (
            <div style={{ paddingTop: 60, textAlign: 'center' }}>
                <div className="empty-state">
                    <div className="empty-icon"><AlertCircle size={32} /></div>
                    <h3 style={{ color: 'var(--text-primary)' }}>Authority Access Required</h3>
                    <p>Only Land Registry Authority admins can register new properties.</p>
                    <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, background: 'var(--accent-green-dim)', border: '2px solid var(--accent-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle size={34} color="var(--accent-green)" />
                </div>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>Property Registered!</h2>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>
                    The land record has been cryptographically sealed and added to the chain.
                </p>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 28, textAlign: 'left' }}>
                    <div className="info-row">
                        <span className="info-label">Owner</span>
                        <span className="info-value">{form.ownerName}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Land Use</span>
                        <span className="info-value">{form.landUse}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Status</span>
                        <span className="info-value"><span className={`badge badge-${form.status}`}>{form.status}</span></span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href={`/properties/${newPropId}`} className="btn btn-primary">View Record</Link>
                    <Link href="/properties" className="btn btn-secondary">All Properties</Link>
                    <button className="btn btn-ghost" onClick={() => { setSubmitted(false); setStep(1); setDrawnCoords(null); setForm({ ownerName: '', ownerNID: '', ownerEmail: '', address: '', district: 'Pune', state: 'Maharashtra', country: 'India', landUse: 'Residential', status: 'registered', description: '' }); }}>
                        Register Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Link href="/properties" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
                <ArrowLeft size={14} /> Back
            </Link>

            <div className="page-header">
                <div className="page-header-left">
                    <h2>Register New Property</h2>
                    <p>Draw the parcel boundary on the map, then fill in the property details</p>
                </div>
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center' }}>
                {[
                    { n: 1, label: 'Draw Boundary' },
                    { n: 2, label: 'Property Info' },
                    { n: 3, label: 'Review & Submit' },
                ].map((s, i) => (
                    <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: step >= s.n ? 'var(--accent-green)' : 'var(--bg-card)',
                            border: `2px solid ${step >= s.n ? 'var(--accent-green)' : 'var(--border-primary)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, color: step >= s.n ? '#0a0c10' : 'var(--text-muted)',
                            flexShrink: 0,
                        }}>
                            {s.n}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: step >= s.n ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</span>
                        {i < 2 && <div style={{ width: 32, height: 1, background: 'var(--border-primary)', margin: '0 4px' }} />}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div>
                    <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--accent-blue-dim)', border: '1px solid rgba(78,154,241,0.25)' }}>
                        <Info size={16} color="var(--accent-blue)" />
                        <p style={{ color: 'var(--accent-blue)', fontSize: 13 }}>
                            Use the polygon tool (pentagon icon) in the map toolbar to draw the property boundary. Click each corner, then close the shape.
                        </p>
                    </div>
                    <div style={{ height: 480, marginBottom: 16, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        <MapView
                            properties={properties}
                            height="480px"
                            showDraw={true}
                            onPolygonDrawn={handlePolygonDrawn}
                        />
                    </div>
                    {drawnCoords ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                            <CheckCircle size={18} color="var(--status-registered)" />
                            <span style={{ color: 'var(--status-registered)', fontWeight: 600, fontSize: 14 }}>
                                Boundary drawn! {computeAreaApprox(drawnCoords).toLocaleString()} m² approx. area
                            </span>
                            <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setStep(2)}>
                                Next: Property Info →
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13 }}>
                            <MapPin size={16} /> Draw the property polygon on the map to continue
                        </div>
                    )}
                </div>
            )}

            {step === 2 && (
                <div style={{ maxWidth: 720 }}>
                    <div className="grid-2" style={{ gap: 16 }}>
                        {[
                            { label: 'Owner Full Name', name: 'ownerName', placeholder: 'e.g. Rajesh Kumar', required: true },
                            { label: 'National ID / Aadhar', name: 'ownerNID', placeholder: 'e.g. NIDMH1234567', required: true },
                            { label: 'Owner Email', name: 'ownerEmail', placeholder: 'owner@email.com', required: true },
                            { label: 'Property Address', name: 'address', placeholder: 'Plot No., Street, Area', required: true },
                            { label: 'District', name: 'district', placeholder: 'District', required: true },
                            { label: 'State', name: 'state', placeholder: 'State', required: true },
                        ].map(f => (
                            <div key={f.name} className="form-group">
                                <label className="form-label">{f.label}</label>
                                <input className="form-input" name={f.name} placeholder={f.placeholder} value={(form as any)[f.name]} onChange={handleFormChange} />
                            </div>
                        ))}
                        <div className="form-group">
                            <label className="form-label">Land Use</label>
                            <select className="form-select" name="landUse" value={form.landUse} onChange={handleFormChange}>
                                {LAND_USES.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Initial Status</label>
                            <select className="form-select" name="status" value={form.status} onChange={handleFormChange}>
                                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: 16 }}>
                        <label className="form-label">Description</label>
                        <textarea className="form-input" name="description" placeholder="Add notes about the property, land history, or special conditions..." value={form.description} onChange={handleFormChange} style={{ minHeight: 90 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                        <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                        <button
                            className="btn btn-primary"
                            disabled={!form.ownerName || !form.ownerNID || !form.address}
                            onClick={() => setStep(3)}
                        >
                            Review Record →
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div style={{ maxWidth: 680 }}>
                    <div className="card" style={{ marginBottom: 16, background: 'rgba(99,190,123,0.05)', border: '1px solid var(--border-accent)' }}>
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Review Before Submitting</h4>
                        <div>
                            {[
                                { label: 'Owner Name', value: form.ownerName },
                                { label: 'National ID', value: form.ownerNID },
                                { label: 'Email', value: form.ownerEmail },
                                { label: 'Address', value: form.address },
                                { label: 'District / State', value: `${form.district}, ${form.state}` },
                                { label: 'Land Use', value: form.landUse },
                                { label: 'Initial Status', value: form.status },
                                { label: 'Approx. Area', value: drawnCoords ? `${computeAreaApprox(drawnCoords).toLocaleString()} m²` : 'N/A' },
                            ].map(r => (
                                <div key={r.label} className="info-row">
                                    <span className="info-label">{r.label}</span>
                                    <span className="info-value">{r.value || <span style={{ color: 'var(--text-muted)' }}>—</span>}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card" style={{ background: 'var(--accent-green-dim)', border: '1px solid var(--border-accent)', marginBottom: 20 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <CheckCircle size={16} color="var(--accent-green)" style={{ marginTop: 2, flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-green)', marginBottom: 4 }}>Cryptographic Sealing</div>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    Upon submission, this record will be hashed with SHA-256 and appended to the blockchain chain. The record will be permanently tamper-evident.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-secondary" onClick={() => setStep(2)}>← Edit</button>
                        <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
                            Seal & Register Property
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
