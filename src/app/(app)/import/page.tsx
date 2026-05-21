'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ImportPage() {
  const { user, updateProfile } = useAuth();
  const [method, setMethod] = useState<'oauth' | 'url' | 'csv'>('oauth');
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSpotifyConnect = async () => {
    // In a real app, this would redirect to Spotify OAuth
    // For this demo, we simulate a connection
    setImporting(true);
    setTimeout(async () => {
      if (user) {
        await updateProfile({ spotify_connected: true });
        
        // Log import history
        await supabase.from('import_history').insert({
          user_id: user.id,
          source_platform: 'spotify',
          status: 'completed',
          items_imported: 42,
        });
      }
      setImporting(false);
      setSuccess(true);
    }, 2000);
  };

  const handleUrlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.includes('spotify.com/playlist')) {
      setError('Please enter a valid Spotify playlist URL');
      return;
    }
    setError('');
    setImporting(true);
    
    // Simulate import
    setTimeout(async () => {
      if (user) {
        // Create a dummy playlist for the demo
        const { data } = await supabase.from('playlists').insert({
          owner_id: user.id,
          name: 'Imported Playlist',
          description: 'Imported from Spotify via URL',
        }).select().single();
        
        if (data) {
          await supabase.from('import_history').insert({
            user_id: user.id,
            source_platform: 'spotify_url',
            status: 'completed',
            items_imported: 15,
          });
        }
      }
      setImporting(false);
      setSuccess(true);
    }, 2500);
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, gap: 16 }}>
        <div style={{ fontSize: 64 }}>🎵</div>
        <h2>Sign in to import</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You need an account to import your Spotify library.</p>
        <Link href="/login"><button className="btn btn-primary btn-lg">Sign In</button></Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, gap: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
        <h1>Import Successful!</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 400, marginBottom: 24 }}>
          Your music has been successfully imported to BuzzBeats. It might take a few minutes for all tracks to appear in your library.
        </p>
        <Link href="/library">
          <button className="btn btn-primary btn-lg">Go to Library</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30,215,96,0.2) 0%, rgba(30,215,96,0.05) 100%)',
        padding: '48px 32px 32px',
        borderBottom: '1px solid rgba(30,215,96,0.1)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: '#1DB954',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(30,215,96,0.4)',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.6 14.6c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.9-9.3-1-.4.1-.7-.2-.8-.5-.1-.4.2-.7.5-.8 4.1-1 7.5-.6 10.3 1.1.3.1.4.5.2.9zm1.3-2.9c-.2.4-.7.5-1.1.3-2.9-1.8-6.5-2.2-10.4-1.2-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 4.4-1.1 8.4-.7 11.6 1.3.4.2.6.7.4 1.1zm.1-3c-3.4-2-8.2-2.2-11.7-1.2-.5.1-1-.2-1.1-.7-.1-.5.2-1 .7-1.1 4-.1 9.3.4 13.1 2.6.5.3.6.8.3 1.3-.2.4-.8.6-1.3.3z"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, marginBottom: 8 }}>Import your music</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Bring your Spotify playlists and liked songs to BuzzBeats in seconds.</p>
      </div>

      <div className="page-container" style={{ maxWidth: 640, paddingTop: 40 }}>
        {user.spotify_connected && method === 'oauth' ? (
          <div className="card" style={{ padding: 32, textAlign: 'center', border: '1px solid #1DB954' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ marginBottom: 8 }}>Spotify Connected</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Your account is linked. We periodically sync your latest saved tracks and playlists.
            </p>
            <button className="btn btn-secondary" onClick={() => setMethod('url')}>
              Import a specific playlist instead
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
              <button
                className={`btn ${method === 'oauth' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setMethod('oauth')}
                style={{ flex: 1, background: method === 'oauth' ? '#1DB954' : '' }}
              >
                Connect Account
              </button>
              <button
                className={`btn ${method === 'url' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setMethod('url')}
                style={{ flex: 1 }}
              >
                Playlist URL
              </button>
            </div>

            {method === 'oauth' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
                  Securely link your Spotify account to automatically import all your public playlists, followed artists, and saved tracks.
                </p>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ background: '#1DB954', color: 'white', width: '100%', gap: 12 }}
                  onClick={handleSpotifyConnect}
                  disabled={importing}
                >
                  {importing ? (
                    <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.6 14.6c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.9-9.3-1-.4.1-.7-.2-.8-.5-.1-.4.2-.7.5-.8 4.1-1 7.5-.6 10.3 1.1.3.1.4.5.2.9zm1.3-2.9c-.2.4-.7.5-1.1.3-2.9-1.8-6.5-2.2-10.4-1.2-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 4.4-1.1 8.4-.7 11.6 1.3.4.2.6.7.4 1.1zm.1-3c-3.4-2-8.2-2.2-11.7-1.2-.5.1-1-.2-1.1-.7-.1-.5.2-1 .7-1.1 4-.1 9.3.4 13.1 2.6.5.3.6.8.3 1.3-.2.4-.8.6-1.3.3z"/>
                      </svg>
                      Connect with Spotify
                    </>
                  )}
                </button>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 16 }}>
                  We only request read access to your library. We will never modify your Spotify account.
                </p>
              </div>
            )}

            {method === 'url' && (
              <form onSubmit={handleUrlImport}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                  Paste a public Spotify playlist link below to import it into your BuzzBeats library.
                </p>
                
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 8 }}>Spotify Playlist URL</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://open.spotify.com/playlist/..."
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    required
                  />
                  {error && <p style={{ color: '#ef4444', fontSize: 'var(--text-xs)', marginTop: 8 }}>{error}</p>}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  disabled={importing || !url}
                >
                  {importing ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Import Playlist'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
