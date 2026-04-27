'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, FileText, Plus, Building2, Shield, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/map', label: 'Map Explorer', icon: Map },
  { href: '/properties', label: 'All Properties', icon: FileText },
  { href: '/register-property', label: 'Register Property', icon: Plus },
];

const userLinks = [
  { href: '/my-properties', label: 'My Properties', icon: Building2 },
  { href: '/map', label: 'Map Explorer', icon: Map },
  { href: '/properties', label: 'Browse Properties', icon: FileText },
];

interface SidebarProps {
  onWidthChange?: (width: number) => void;
}

export default function Sidebar({ onWidthChange }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const links = isAdmin ? adminLinks : userLinks;

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    onWidthChange?.(next ? COLLAPSED_WIDTH : EXPANDED_WIDTH);
  };

  useEffect(() => {
    onWidthChange?.(collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH);
  }, [collapsed, onWidthChange]);

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 18px' : '0 20px',
          borderBottom: '1px solid var(--border-primary)',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, var(--accent-green), #4e9af1)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px var(--accent-green-glow)',
          }}
        >
          <Shield size={18} color="#0a0c10" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div>
            <div
              style={{
                fontFamily: 'Space Grotesk,sans-serif',
                fontWeight: 700,
                fontSize: 15,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              TerraLedger
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                fontWeight: 500,
                letterSpacing: '0.06em',
              }}
            >
              LAND REGISTRY
            </div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                color: active ? 'var(--accent-green)' : 'var(--text-secondary)',
                background: active ? 'var(--accent-green-dim)' : 'transparent',
                border: `1px solid ${active ? 'var(--border-accent)' : 'transparent'}`,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        <div style={{ marginTop: 8, borderTop: '1px solid var(--border-primary)', paddingTop: 8 }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              background: 'transparent',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
              transition: 'var(--transition)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <Home size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Home</span>}
          </Link>
        </div>
      </nav>

      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border-primary)', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: isAdmin ? 'var(--accent-purple-dim)' : 'var(--accent-blue-dim)',
              border: `2px solid ${isAdmin ? 'var(--accent-purple)' : 'var(--accent-blue)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: isAdmin ? 'var(--accent-purple)' : 'var(--accent-blue)',
              flexShrink: 0,
            }}
          >
            {currentUser?.firstName?.charAt(0) ?? '?'}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'No session'}
              </div>
              {currentUser && (
                <span className={`badge badge-${currentUser.role}`} style={{ fontSize: 10, padding: '1px 7px' }}>
                  {currentUser.role.toUpperCase()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        style={{
          position: 'absolute',
          right: -12,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 24,
          height: 24,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          transition: 'var(--transition)',
          zIndex: 10,
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}

