'use client';

import Link from 'next/link';
import { Shield, Map, FileText, Lock, ChevronRight, Globe, Database, CheckCircle2, Layers } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ padding: '20px 0' }}>
      {/* Hero */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(99,190,123,0.06) 0%, rgba(78,154,241,0.04) 50%, transparent 100%)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: '80px 60px',
        marginBottom: 40,
        overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(var(--accent-green) 1px, transparent 1px), linear-gradient(90deg, var(--accent-green) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          borderRadius: 'var(--radius-xl)',
        }} />

        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(99,190,123,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{
              width: 44, height: 44,
              background: 'linear-gradient(135deg, var(--accent-green), #4e9af1)',
              borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px var(--accent-green-glow)',
            }}>
              <Shield size={22} color="#0a0c10" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              TerraLedger v1.0
            </span>
          </div>

          <h1 style={{ marginBottom: 20, color: 'var(--text-primary)' }}>
            The Future of{' '}
            <span className="gradient-text">Land Registry</span>{' '}
            is Here
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 560, lineHeight: 1.7, marginBottom: 36 }}>
            Immutable, geofenced property records on OpenStreetMaps. Every parcel cryptographically verified,
            every boundary precisely mapped, every transaction permanently recorded.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn btn-primary btn-lg">
              <LayoutDashboardIcon size={18} />
              Go to Dashboard
            </Link>
            <Link href="/map" className="btn btn-secondary btn-lg">
              <Map size={18} />
              Explore Map
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 28, marginTop: 40, flexWrap: 'wrap' }}>
            {[
              { value: '10', label: 'Parcels Registered' },
              { value: '8', label: 'Verified Records' },
              { value: 'SHA-256', label: 'Crypto Standard' },
              { value: '100%', label: 'OSM Coverage' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--accent-green)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 8, color: 'var(--text-primary)' }}>
          Built for Trust & Transparency
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 36 }}>
          Every feature designed to eliminate fraud and disputes in land registration
        </p>
        <div className="grid-3" style={{ gap: 16 }}>
          {[
            {
              icon: <Map size={24} color="var(--accent-green)" />,
              title: 'Geofenced Parcels',
              desc: 'Draw precise property boundaries directly on OpenStreetMaps. Color-coded by status — registered, pending, or disputed.',
              color: 'var(--accent-green)',
            },
            {
              icon: <Lock size={24} color="var(--accent-blue)" />,
              title: 'Cryptographic Records',
              desc: 'Each record is SHA-256 hashed and linked to its predecessor, creating a tamper-evident chain that cannot be altered.',
              color: 'var(--accent-blue)',
            },
            {
              icon: <Database size={24} color="var(--accent-purple)" />,
              title: 'Immutable History',
              desc: 'Complete ownership transfer history, every document upload, every status change — permanently recorded and verifiable.',
              color: 'var(--accent-purple)',
            },
            {
              icon: <Globe size={24} color="var(--accent-amber)" />,
              title: 'OpenStreetMaps',
              desc: 'Free, open, and accurate maps. Geofence polygons visualize exact parcel boundaries accessible to any authorized user.',
              color: 'var(--accent-amber)',
            },
            {
              icon: <Shield size={24} color="var(--accent-red)" />,
              title: 'Authority Control',
              desc: 'Registry admins have exclusive rights to register new parcels and approve records. Users can browse and verify their titles.',
              color: 'var(--accent-red)',
            },
            {
              icon: <CheckCircle2 size={24} color="var(--accent-green)" />,
              title: 'Instant Verification',
              desc: 'Property owners and third parties can instantly verify title authenticity by checking the cryptographic hash chain.',
              color: 'var(--accent-green)',
            },
          ].map(f => (
            <div key={f.title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                width: 48, height: 48,
                background: `${f.color}18`,
                border: `1px solid ${f.color}30`,
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {f.icon}
              </div>
              <h4 style={{ color: 'var(--text-primary)' }}>{f.title}</h4>
              <p style={{ fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,190,123,0.08), rgba(78,154,241,0.05))' }}>
        <h3 style={{ marginBottom: 4, color: 'var(--text-primary)' }}>Quick Access</h3>
        <p style={{ fontSize: 14, marginBottom: 24 }}>Jump to any section of TerraLedger</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { href: '/dashboard', label: 'Dashboard', icon: '📊' },
            { href: '/map', label: 'Map Explorer', icon: '🗺️' },
            { href: '/properties', label: 'All Properties', icon: '📋' },
            { href: '/register-property', label: 'Register Property', icon: '➕' },
            { href: '/my-properties', label: 'My Properties', icon: '🏠' },
          ].map(a => (
            <Link key={a.href} href={a.href} className="btn btn-secondary" style={{ gap: 8 }}>
              <span>{a.icon}</span>
              {a.label}
              <ChevronRight size={14} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function LayoutDashboardIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
