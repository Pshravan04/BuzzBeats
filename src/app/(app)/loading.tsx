import React from 'react';

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60vh' }}>
      <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4, marginBottom: 24 }} />
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>Loading your music...</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Fetching the latest hits from JioSaavn</p>
    </div>
  );
}
