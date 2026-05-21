-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  theme TEXT DEFAULT 'blue',
  spotify_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Artists Table
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  verified BOOLEAN DEFAULT false,
  follower_count INTEGER DEFAULT 0,
  genres TEXT[] DEFAULT '{}'
);

-- 3. Albums Table
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  cover_url TEXT NOT NULL,
  release_date DATE,
  genre TEXT,
  song_count INTEGER DEFAULT 0
);

-- 4. Songs Table
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL, -- seconds
  audio_url TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  lyrics TEXT,
  play_count INTEGER DEFAULT 0
);

-- 5. Playlists Table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_collaborative BOOLEAN DEFAULT false,
  description TEXT,
  song_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Playlist Songs Table
CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (playlist_id, song_id)
);

-- 7. Listening Rooms Table
CREATE TABLE IF NOT EXISTS listening_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
  position_ms INTEGER DEFAULT 0,
  is_playing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Liked Songs Table
CREATE TABLE IF NOT EXISTS liked_songs (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  liked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, song_id)
);

-- 9. Import History Table
CREATE TABLE IF NOT EXISTS import_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_platform TEXT NOT NULL,
  status TEXT NOT NULL,
  items_imported INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Demo Data
INSERT INTO artists (id, name, bio, image_url, verified, follower_count, genres)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Neon Pulse', 'Synthwave pioneer from the future.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop', true, 1250000, ARRAY['Synthwave', 'Electronic']),
  ('a0000000-0000-0000-0000-000000000002', 'Lofi Girl', 'Beats to relax/study to.', 'https://images.unsplash.com/photo-1516280440502-a2f02bdf6c72?w=500&h=500&fit=crop', true, 8500000, ARRAY['Lofi Hip Hop', 'Chill'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO albums (id, title, artist_id, cover_url, release_date, genre, song_count)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'Cybernetic Dreams', 'a0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop', '2025-01-01', 'Synthwave', 2),
  ('b0000000-0000-0000-0000-000000000002', 'Midnight Studies', 'a0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?w=500&h=500&fit=crop', '2024-05-15', 'Lofi', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO songs (id, title, artist_id, album_id, duration, audio_url, cover_url, play_count)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'Neon Nights', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 215, 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=neon-gaming-128925.mp3', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop', 5200000),
  ('c0000000-0000-0000-0000-000000000002', 'Cyber City', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 198, 'https://cdn.pixabay.com/download/audio/2022/10/18/audio_31c2730ebb.mp3?filename=cyberpunk-2099-10701.mp3', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop', 3100000),
  ('c0000000-0000-0000-0000-000000000003', 'Study Vibes', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 156, 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf7f6.mp3?filename=lofi-study-112191.mp3', 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?w=500&h=500&fit=crop', 12500000)
ON CONFLICT (id) DO NOTHING;
