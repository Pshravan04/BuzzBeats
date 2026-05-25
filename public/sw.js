// BuzzBeats Service Worker
// Handles: static caching, audio playback, background fetch

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `buzzbeats-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `buzzbeats-dynamic-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ==========================================
// Install — pre-cache static assets
// ==========================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Failed to cache some static assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// ==========================================
// Activate — clean old caches
// ==========================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ==========================================
// Fetch — cache strategies
// ==========================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and Supabase/API requests
  if (request.method !== 'GET') return;
  if (url.hostname.includes('supabase.co')) return;
  if (url.hostname.includes('spotify.com')) return;

  // Audio files — network first with range support
  if (request.headers.get('range') || url.pathname.match(/\.(mp3|ogg|wav|flac|m4a)$/)) {
    // Pass through for range requests (audio streaming)
    return;
  }

  // Google Fonts — cache first
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // Next.js pages — network first, fallback to cache
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return cached || new Response('Offline', { status: 503 });
        }
      })
    );
    return;
  }

  // Page navigations — network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        return cached || caches.match('/offline') || new Response('Offline', { status: 503 });
      })
    );
    return;
  }
});

// ==========================================
// Background Sync (for offline actions)
// ==========================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-likes') {
    event.waitUntil(syncPendingLikes());
  }
  if (event.tag === 'sync-history') {
    event.waitUntil(syncPendingHistory());
  }
});

async function syncPendingLikes() {
  // Sync offline liked songs when back online
  const db = await openDB();
  const pendingLikes = await db.getAll('pending-likes');
  for (const like of pendingLikes) {
    try {
      // Would POST to Supabase here
      console.log('[SW] Syncing like:', like);
      await db.delete('pending-likes', like.id);
    } catch (err) {
      console.warn('[SW] Failed to sync like:', err);
    }
  }
}

async function syncPendingHistory() {
  console.log('[SW] Syncing listening history...');
}

// Simple IndexedDB wrapper
async function openDB() {
  return {
    getAll: async (store) => [],
    delete: async (store, key) => {},
  };
}

// ==========================================
// Push Notifications
// ==========================================
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'BuzzBeats', {
      body: data.body || 'New music is waiting for you!',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find(c => c.url === url);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});

// ==========================================
// Messaging (Download Audio)
// ==========================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'DOWNLOAD_AUDIO') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then(async (cache) => {
        try {
          const response = await fetch(event.data.url);
          if (response.ok) {
            await cache.put(event.data.url, response.clone());
            console.log(`[SW] Cached audio: ${event.data.url}`);
          }
        } catch (err) {
          console.error(`[SW] Failed to cache audio:`, err);
        }
      })
    );
  }
});
