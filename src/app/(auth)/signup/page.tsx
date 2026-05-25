'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    const result = await signUp(email, password, displayName);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', padding: 24,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
          <h1 style={{ marginBottom: 8 }}>Account Created!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            Check your email to confirm your account, then sign in to start listening.
          </p>
          <Link href="/login">
            <button className="btn btn-primary btn-lg">Sign In</button>
          </Link>
        </div>
      </div>
    );
  }

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

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8, cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M12 3a9 9 0 110 18A9 9 0 0112 3zm0 2a7 7 0 100 14A7 7 0 0012 5zm0 2a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z"/></svg>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>BuzzBeats</span>
            </div>
          </Link>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Join millions listening on BuzzBeats</p>
        </div>

        <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)', padding: 32, border: '1px solid var(--border-subtle)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="signup-name" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 8 }}>Display Name</label>
              <input id="signup-name" type="text" className="input" placeholder="Your name" value={displayName} onChange={e => setDisplayName(e.target.value)} required autoComplete="name" />
            </div>
            <div>
              <label htmlFor="signup-email" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 8 }}>Email</label>
              <input id="signup-email" type="email" className="input" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label htmlFor="signup-password" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 8 }}>Password</label>
              <input id="signup-password" type="password" className="input" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <div>
              <label htmlFor="signup-confirm" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 8 }}>Confirm Password</label>
              <input id="signup-confirm" type="password" className="input" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', color: '#ef4444', fontSize: 'var(--text-sm)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 8, width: '100%' }} id="signup-submit-btn">
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
