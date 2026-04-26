'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
    ArrowLeft, MapPin, User, Calendar, FileText, Hash,
    Shield, AlertTriangle, Clock, CheckCircle, ArrowUpRight,
    ChevronRight, ExternalLink, Layers, Loader
} from 'lucide-react';
import { Property } from '@/types';

const MapView = dynamic(() => import('@/components/map/MapView'), {
    ssr: false,
    loading: () => <div style={{ height: 300, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading map...</div>,
});

const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'registered') return <CheckCircle size={16} color="var(--status-registered)" />;
    if (status === 'pending') return <Clock size={16} color="var(--status-pending)" />;
    return <AlertTriangle size={16} color="var(--status-disputed)" />;
};

interface PropertyDetail extends Property {
    owner?: {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
        aadharNumber?: string;
    };
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [property, setProperty] = useState<PropertyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/properties/${id}`);
                
                if (!response.ok) {
                    throw new Error('Property not found');
                }
                
                const result = await response.json();
                if (result.success) {
                    setProperty(result.data);
                } else {
                    throw new Error(result.error || 'Failed to fetch property');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch property');
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 10 }}>
                <Loader size={20} className="spin" />
                <span>Loading property details...</span>
            </div>
        );
    }

    if (error || !property) return notFound();

    const ownerName = property.owner ? `${property.owner.firstName} ${property.owner.lastName}` : 'Unknown';
    const createdDate = new Date(property.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const updatedDate = new Date(property.updatedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div>
            {/* Back */}
            <Link href="/properties" className="btn btn-ghost btn-sm" style={{ marginBottom: 20, gap: 6 }}>
                <ArrowLeft size={15} /> Back to Properties
            </Link>

            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(99,190,123,0.06), rgba(78,154,241,0.04))',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-xl)',
                padding: '28px 32px',
                marginBottom: 24,
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <StatusIcon status={property.status} />
                            <span className={`badge badge-${property.status}`}>{property.status.toUpperCase()}</span>
                            <span className="tag">{property.propertyType}</span>
                        </div>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'monospace', fontSize: 22 }}>
                            {property.registryNumber}
                        </h2>
                        <p style={{ fontSize: 15, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MapPin size={14} color="var(--accent-green)" /> {property.address}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--accent-green)' }}>
                            {property.area.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Square Meters</div>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ gap: 20 }}>
                {/* Left column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Owner Info */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <User size={16} color="var(--accent-green)" />
                            <h4 style={{ color: 'var(--text-primary)' }}>Owner Information</h4>
                        </div>
                        <div>
                            {[
                                { label: 'Full Name', value: ownerName },
                                { label: 'National ID', value: property.owner?.aadharNumber || 'Not provided' },
                                { label: 'Email', value: property.owner?.email || 'N/A' },
                                { label: 'Survey Number', value: property.surveyNumber || 'N/A' },
                            ].map(r => (
                                <div key={r.label} className="info-row">
                                    <span className="info-label">{r.label}</span>
                                    <span className="info-value" style={{ fontFamily: r.label === 'National ID' || r.label === 'Email' ? 'monospace' : undefined }}>
                                        {r.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <FileText size={16} color="var(--accent-blue)" />
                            <h4 style={{ color: 'var(--text-primary)' }}>Property Details</h4>
                        </div>
                        <div>
                            {[
                                { label: 'Title', value: property.title },
                                { label: 'Property Type', value: property.propertyType },
                                { label: 'Area', value: `${property.area.toLocaleString()} m²` },
                                { label: 'Registry Number', value: property.registryNumber },
                                { label: 'Survey Number', value: property.surveyNumber || 'N/A' },
                                { label: 'Status', value: property.status },
                                { label: 'Created', value: createdDate },
                                { label: 'Last Updated', value: updatedDate },
                            ].map(r => (
                                <div key={r.label} className="info-row">
                                    <span className="info-label">{r.label}</span>
                                    <span className="info-value">{r.value}</span>
                                </div>
                            ))}
                        </div>
                        {property.description && (
                            <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-green)' }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</div>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{property.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Location Map */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Layers size={16} color="var(--accent-green)" />
                            <h4 style={{ color: 'var(--text-primary)' }}>Property Location</h4>
                        </div>
                        <MapView
                            properties={[
                                {
                                    _id: property._id,
                                    id: property._id,
                                    title: property.title,
                                    address: property.address,
                                    location: property.location,
                                    area: property.area,
                                    propertyType: property.propertyType,
                                    status: property.status,
                                    registryNumber: property.registryNumber,
                                    geometry: property.geometry,
                                    createdAt: property.createdAt,
                                }
                            ]}
                            center={[property.location.coordinates[1], property.location.coordinates[0]]}
                            zoom={15}
                            height="300px"
                            selectedId={property._id}
                        />
                        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-primary)', display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                            <span>Lat: {property.location.coordinates[1].toFixed(6)}</span>
                            <span>Lng: {property.location.coordinates[0].toFixed(6)}</span>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <FileText size={16} color="var(--accent-amber)" />
                            <h4 style={{ color: 'var(--text-primary)' }}>Additional Information</h4>
                        </div>
                        <div>
                            {[
                                { label: 'Property ID', value: property._id },
                                { label: 'Document URL', value: property.documentUrl ? <a href={property.documentUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>View Document</a> : 'Not provided' },
                            ].map(r => (
                                <div key={r.label} className="info-row">
                                    <span className="info-label">{r.label}</span>
                                    <span className="info-value" style={{ fontFamily: r.label === 'Property ID' ? 'monospace' : undefined, fontSize: r.label === 'Property ID' ? 11 : 13 }}>
                                        {typeof r.value === 'string' ? r.value : r.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
