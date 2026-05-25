'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background removed for clean look */}

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 8, cursor: 'pointer' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="black">
                  <path d="M12 3a9 9 0 110 18A9 9 0 0112 3zm0 2a7 7 0 100 14A7 7 0 0012 5zm0 2a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--text-primary)' }}>
                BuzzBeats
              </span>
            </div>
          </Link>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Sign in to continue listening</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)', padding: 32, border: '1px solid var(--border-subtle)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 8 }}>Email</label>
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label htmlFor="login-password" style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Password</label>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                  Forgot password?
                </button>
              </div>
              <input
                id="login-password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-sm)', padding: '10px 16px',
                color: '#ef4444', fontSize: 'var(--text-sm)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ marginTop: 8, width: '100%' }}
              id="login-submit-btn"
            >
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one</Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
