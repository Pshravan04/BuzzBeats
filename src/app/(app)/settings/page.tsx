'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import type { Theme } from '@/types';

const THEMES: { key: Theme; label: string; color: string; gradient: string }[] = [
  { key: 'blue', label: 'YouTube Red', color: '#FF0000', gradient: 'linear-gradient(135deg, #CC0000, #FF0000)' },
  { key: 'purple', label: 'Mystic Purple', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #6D28D9, #8B5CF6)' },
  { key: 'grey', label: 'Slate Grey', color: '#94A3B8', gradient: 'linear-gradient(135deg, #64748B, #94A3B8)' },
  { key: 'pink', label: 'Neon Pink', color: '#EC4899', gradient: 'linear-gradient(135deg, #BE185D, #EC4899)' },
  { key: 'green', label: 'Emerald Green', color: '#10B981', gradient: 'linear-gradient(135deg, #047857, #10B981)' },
];

export default function SettingsPage() {
  const { user, updateProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'account' | 'about'>('profile');
  const supabase = createClient();

  const saveProfile = async () => {
    setSaving(true);
    await updateProfile({ display_name: displayName });
    setSaveMsg('Saved!');
    setTimeout(() => setSaveMsg(''), 2000);
    setSaving(false);
  };

  const handleThemeChange = async (t: Theme) => {
    setTheme(t);
    if (user) await updateProfile({ theme: t });
  };

  const TABS = [
    { key: 'profile', label: 'Profile', icon: '👤' },
    { key: 'appearance', label: 'Appearance', icon: '🎨' },
    { key: 'account', label: 'Account', icon: '⚙️' },
    { key: 'about', label: 'About', icon: 'ℹ️' },
  ] as const;

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: 20 }}>Settings</h1>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 0 }}>
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === key ? `2px solid var(--accent)` : '2px solid transparent',
                color: activeTab === key ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === key ? 700 : 400,
                fontSize: 'var(--text-sm)',
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                marginBottom: -1,
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      <div className="page-container" style={{ maxWidth: 640, paddingTop: 32 }}>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {!user ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
                <h2 style={{ marginBottom: 8 }}>Not signed in</h2>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <Link href="/login"><button className="btn btn-primary">Sign In</button></Link>
                  <Link href="/signup"><button className="btn btn-secondary">Create Account</button></Link>
                </div>
              </div>
            ) : (
              <>
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="avatar-placeholder" style={{ width: 80, height: 80, fontSize: 32, background: 'var(--gradient-accent)' }}>
                    {user.display_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <button className="btn btn-secondary btn-sm">Change Photo</button>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 4 }}>JPG, PNG up to 5MB</p>
                  </div>
                </div>

                {/* Display name */}
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 8 }}>Display Name</label>
                  <input
                    className="input"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                  />
                </div>

                {/* Email (read only) */}
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 8 }}>Email</label>
                  <input className="input" value={user.email} disabled style={{ opacity: 0.6 }} />
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                    {saving ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save Changes'}
                  </button>
                  {saveMsg && <span style={{ color: '#10b981', fontSize: 'var(--text-sm)' }}>✓ {saveMsg}</span>}
                </div>
              </>
            )}
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 8 }}>Theme Color</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 20 }}>
                Choose an accent color for the entire app
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {THEMES.map(({ key, label, color, gradient }) => (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    style={{
                      border: theme === key ? `2px solid ${color}` : '2px solid var(--border-default)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 16,
                      background: theme === key ? `${color}15` : 'var(--bg-elevated)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    }}
                    aria-pressed={theme === key}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: gradient,
                      boxShadow: theme === key ? `0 0 20px ${color}60` : 'none',
                      transition: 'box-shadow 0.3s',
                    }} />
                    <div style={{ fontWeight: theme === key ? 700 : 500, fontSize: 'var(--text-sm)', color: theme === key ? color : 'var(--text-primary)' }}>
                      {label}
                    </div>
                    {theme === key && <div style={{ color, fontSize: 18 }}>✓</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{ padding: 24, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ marginBottom: 16 }}>Theme Preview</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm">Primary</button>
                <button className="btn btn-secondary btn-sm">Secondary</button>
                <span className="badge badge-accent">Live</span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 32 }}>
                  {[1,2,3,4,5].map(i => <div key={i} className="beat-bar" style={{ width: 6 }} />)}
                </div>
              </div>
              <div style={{ marginTop: 16, height: 6, background: 'var(--border-default)', borderRadius: 'var(--radius-full)' }}>
                <div style={{ height: '100%', width: '60%', background: 'var(--gradient-accent)', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 8 }}>Account Settings</h2>

            {user && (
              <>
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ marginBottom: 4 }}>Spotify Integration</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
                    {user.spotify_connected ? '✅ Connected to Spotify' : 'Import your playlists from Spotify'}
                  </p>
                  <Link href="/import">
                    <button className="btn btn-secondary">
                      {user.spotify_connected ? 'Manage Spotify' : 'Connect Spotify'}
                    </button>
                  </Link>
                </div>

                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ marginBottom: 4 }}>Privacy</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 12 }}>
                    Control who can see your activity
                  </p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)', width: 18, height: 18 }} />
                    <span style={{ fontSize: 'var(--text-sm)' }}>Show listening activity to friends</span>
                  </label>
                </div>

                <div className="card" style={{ padding: 20, border: '1px solid rgba(239,68,68,0.3)' }}>
                  <h3 style={{ marginBottom: 4, color: '#ef4444' }}>Danger Zone</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
                    These actions are irreversible
                  </p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-secondary btn-sm" onClick={signOut}>
                      Sign Out
                    </button>
                    <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                      Delete Account
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Logo + brand */}
            <div style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: 'var(--gradient-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', boxShadow: 'var(--shadow-glow)',
              }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="white">
                  <path d="M12 3a9 9 0 110 18A9 9 0 0112 3zm0 2a7 7 0 100 14A7 7 0 0012 5zm0 2a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z"/>
                </svg>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
                BuzzBeats
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Version 1.0.0 — MVP</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Music for the Next Generation</p>
            </div>

            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                🎨 Designed and developed by{' '}
                <strong style={{ color: 'var(--accent)' }}>Shravan</strong>
                <br />
                ✨ Brand credits to{' '}
                <strong style={{ color: 'var(--accent)' }}>Gauri</strong>
              </p>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ marginBottom: 12 }}>Install as App</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
                BuzzBeats works as a Progressive Web App (PWA). Install it on your device for the best experience.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { platform: '🖥️ Windows / Chrome', steps: 'Click the install icon in the address bar' },
                  { platform: '🤖 Android / Chrome', steps: 'Tap ⋮ → "Add to Home Screen"' },
                  { platform: '🍎 iPhone / Safari', steps: 'Tap Share → "Add to Home Screen"' },
                ].map(({ platform, steps }) => (
                  <div key={platform} style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 4 }}>{platform}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{steps}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', padding: '8px 0 32px' }}>
              <p>Built with Next.js, Supabase & ❤️</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
