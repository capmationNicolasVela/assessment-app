'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const next = searchParams.get('next') || '/admin/dashboard';
      router.push(next);
    } else {
      setError('Incorrect password.');
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 360, margin: '40px auto 0' }}>
      <h2 style={{ color: 'var(--brand)', marginBottom: 20, fontSize: '1.1rem' }}>Sign in</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="field-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Coordinator password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <>
      <div className="page-header">
        <h1>Coordinator Access</h1>
        <p>API Knowledge Check · Results Dashboard</p>
      </div>
      <div className="container">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </>
  );
}
