'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { currentUser, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        height: 64,
        background: 'rgba(10, 12, 16, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        zIndex: 100,
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          TerraLedger
        </h1>
        {isAdmin && (
          <span className="badge badge-admin" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Shield size={10} />
            Admin
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 'var(--radius-full)',
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--status-registered)',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--status-registered)',
              boxShadow: '0 0 6px rgba(34,197,94,0.5)',
            }}
          />
          Connected
        </div>

        <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }} type="button">
          <Bell size={18} />
        </button>

        {currentUser ? (
          <>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: isAdmin ? 'var(--accent-purple-dim)' : 'var(--accent-blue-dim)',
                border: `2px solid ${isAdmin ? 'var(--accent-purple)' : 'var(--accent-blue)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                color: isAdmin ? 'var(--accent-purple)' : 'var(--accent-blue)',
              }}
            >
              {currentUser.firstName.charAt(0)}
            </div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={handleLogout}>
              <LogOut size={14} />
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="btn btn-secondary btn-sm">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

