import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="card" style={{ maxWidth: 520, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>Access Denied</h2>
        <p style={{ marginBottom: 18 }}>
          Your account does not have permission to access this page.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/my-properties" className="btn btn-secondary">
            My Properties
          </Link>
          <Link href="/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

