-- ================================================
-- BuzzBeats — Supabase Database Schema
-- Run this in your Supabase SQL editor
-- ================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fuzzy search

-- ================================================
-- PROFILES (extends Supabase auth.users)
-- ================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  display_name text not null default 'BuzzBeats User',
  avatar_url text,
  theme text not null default 'blue' check (theme in ('blue','purple','grey','pink','green')),
  spotify_connected boolean not null default false,
  spotify_access_token text,
  spotify_refresh_token text,
  spotify_token_expires_at timestamptz,
  bio text,
  follower_count integer not null default 0,
  following_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ================================================
-- ARTISTS
-- ================================================
create table public.artists (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  bio text,
  image_url text,
  verified boolean not null default false,
  follower_count integer not null default 0,
  genres text[] default '{}',
  created_at timestamptz not null default now()
);

-- Full-text search index on artists
create index artists_name_trgm_idx on public.artists using gin (name gin_trgm_ops);

-- ================================================
-- ALBUMS
-- ================================================
create table public.albums (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  artist_id uuid references public.artists(id) on delete cascade not null,
  cover_url text not null default '/images/default-album.jpg',
  release_date date,
  genre text,
  song_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index albums_artist_idx on public.albums(artist_id);
create index albums_title_trgm_idx on public.albums using gin (title gin_trgm_ops);

-- ================================================
-- SONGS
-- ================================================
create table public.songs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  artist_id uuid references public.artists(id) on delete cascade not null,
  album_id uuid references public.albums(id) on delete set null,
  duration integer not null default 0, -- seconds
  audio_url text not null,
  cover_url text not null default '/images/default-album.jpg',
  lyrics text,
  play_count bigint not null default 0,
  is_explicit boolean not null default false,
  track_number integer,
  created_at timestamptz not null default now()
);

create index songs_artist_idx on public.songs(artist_id);
create index songs_album_idx on public.songs(album_id);
create index songs_title_trgm_idx on public.songs using gin (title gin_trgm_ops);

-- ================================================
-- PLAYLISTS
-- ================================================
create table public.playlists (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  cover_url text,
  is_public boolean not null default false,
  is_collaborative boolean not null default false,
  description text,
  song_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index playlists_owner_idx on public.playlists(owner_id);
create index playlists_name_trgm_idx on public.playlists using gin (name gin_trgm_ops);

-- ================================================
-- PLAYLIST SONGS
-- ================================================
create table public.playlist_songs (
  id uuid default uuid_generate_v4() primary key,
  playlist_id uuid references public.playlists(id) on delete cascade not null,
  song_id uuid references public.songs(id) on delete cascade not null,
  position integer not null default 0,
  added_by uuid references public.profiles(id) on delete set null,
  added_at timestamptz not null default now(),
  unique(playlist_id, song_id)
);

create index playlist_songs_playlist_idx on public.playlist_songs(playlist_id);

-- ================================================
-- PLAYLIST COLLABORATORS
-- ================================================
create table public.playlist_collaborators (
  playlist_id uuid references public.playlists(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'editor' check (role in ('editor', 'viewer')),
  joined_at timestamptz not null default now(),
  primary key (playlist_id, user_id)
);

-- ================================================
-- LIKED SONGS
-- ================================================
create table public.liked_songs (
  user_id uuid references public.profiles(id) on delete cascade not null,
  song_id uuid references public.songs(id) on delete cascade not null,
  liked_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

create index liked_songs_user_idx on public.liked_songs(user_id);

-- ================================================
-- LISTENING HISTORY
-- ================================================
create table public.listening_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  song_id uuid references public.songs(id) on delete cascade not null,
  played_at timestamptz not null default now(),
  duration_played integer not null default 0 -- seconds
);

create index listening_history_user_idx on public.listening_history(user_id, played_at desc);

-- ================================================
-- LISTENING ROOMS (Collaborative)
-- ================================================
create table public.listening_rooms (
  id uuid default uuid_generate_v4() primary key,
  name text not null default 'BuzzBeats Room',
  playlist_id uuid references public.playlists(id) on delete set null,
  host_id uuid references public.profiles(id) on delete cascade not null,
  current_song_id uuid references public.songs(id) on delete set null,
  position_ms integer not null default 0,
  is_playing boolean not null default false,
  invite_code text unique not null default upper(substring(md5(random()::text) from 1 for 8)),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index rooms_host_idx on public.listening_rooms(host_id);
create index rooms_invite_idx on public.listening_rooms(invite_code);

-- ================================================
-- ROOM PARTICIPANTS
-- ================================================
create table public.room_participants (
  room_id uuid references public.listening_rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

-- ================================================
-- SPOTIFY IMPORTS
-- ================================================
create table public.spotify_imports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  spotify_playlist_id text not null,
  playlist_name text not null,
  import_status text not null default 'pending' check (import_status in ('pending','importing','done','error')),
  total_songs integer not null default 0,
  imported_songs integer not null default 0,
  songs_json jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ================================================
-- USER FOLLOWS
-- ================================================
create table public.user_follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

-- ================================================
-- TRIGGERS
-- ================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update playlist song_count on insert/delete
create or replace function public.update_playlist_song_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.playlists set song_count = song_count + 1, updated_at = now()
    where id = NEW.playlist_id;
  elsif (TG_OP = 'DELETE') then
    update public.playlists set song_count = greatest(song_count - 1, 0), updated_at = now()
    where id = OLD.playlist_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_playlist_song_change
  after insert or delete on public.playlist_songs
  for each row execute procedure public.update_playlist_song_count();

-- Update album song_count
create or replace function public.update_album_song_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.albums set song_count = song_count + 1 where id = NEW.album_id;
  elsif (TG_OP = 'DELETE' and OLD.album_id is not null) then
    update public.albums set song_count = greatest(song_count - 1, 0) where id = OLD.album_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_song_change
  after insert or delete on public.songs
  for each row execute procedure public.update_album_song_count();

-- Increment play_count when history is inserted
create or replace function public.increment_play_count()
returns trigger as $$
begin
  update public.songs set play_count = play_count + 1 where id = NEW.song_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_history_insert
  after insert on public.listening_history
  for each row execute procedure public.increment_play_count();

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.albums enable row level security;
alter table public.songs enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_songs enable row level security;
alter table public.playlist_collaborators enable row level security;
alter table public.liked_songs enable row level security;
alter table public.listening_history enable row level security;
alter table public.listening_rooms enable row level security;
alter table public.room_participants enable row level security;
alter table public.spotify_imports enable row level security;
alter table public.user_follows enable row level security;

-- Profiles: users can read all, update their own
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Artists: public read
create policy "Artists are viewable by everyone" on public.artists for select using (true);

-- Albums: public read
create policy "Albums are viewable by everyone" on public.albums for select using (true);

-- Songs: public read
create policy "Songs are viewable by everyone" on public.songs for select using (true);

-- Playlists: public playlists viewable by all; private only by owner/collaborators
create policy "Public playlists viewable by everyone" on public.playlists for select
  using (is_public = true or owner_id = auth.uid() or
    exists(select 1 from public.playlist_collaborators pc where pc.playlist_id = id and pc.user_id = auth.uid()));
create policy "Users can create playlists" on public.playlists for insert with check (auth.uid() = owner_id);
create policy "Owners can update playlists" on public.playlists for update using (auth.uid() = owner_id);
create policy "Owners can delete playlists" on public.playlists for delete using (auth.uid() = owner_id);

-- Playlist songs: viewable if playlist is viewable
create policy "Playlist songs viewable if playlist is viewable" on public.playlist_songs for select
  using (exists(select 1 from public.playlists p where p.id = playlist_id and
    (p.is_public = true or p.owner_id = auth.uid() or
      exists(select 1 from public.playlist_collaborators pc where pc.playlist_id = p.id and pc.user_id = auth.uid()))));
create policy "Owners/editors can add songs" on public.playlist_songs for insert
  with check (exists(select 1 from public.playlists p where p.id = playlist_id and
    (p.owner_id = auth.uid() or
      exists(select 1 from public.playlist_collaborators pc where pc.playlist_id = p.id and pc.user_id = auth.uid() and pc.role = 'editor'))));
create policy "Owners/editors can remove songs" on public.playlist_songs for delete
  using (exists(select 1 from public.playlists p where p.id = playlist_id and
    (p.owner_id = auth.uid() or
      exists(select 1 from public.playlist_collaborators pc where pc.playlist_id = p.id and pc.user_id = auth.uid() and pc.role = 'editor'))));

-- Liked songs: users can manage their own
create policy "Users can view own liked songs" on public.liked_songs for select using (auth.uid() = user_id);
create policy "Users can like songs" on public.liked_songs for insert with check (auth.uid() = user_id);
create policy "Users can unlike songs" on public.liked_songs for delete using (auth.uid() = user_id);

-- Listening history: users can manage their own
create policy "Users can view own history" on public.listening_history for select using (auth.uid() = user_id);
create policy "Users can add to history" on public.listening_history for insert with check (auth.uid() = user_id);

-- Rooms: host can manage, participants can view
create policy "Rooms are viewable by participants" on public.listening_rooms for select using (
  host_id = auth.uid() or
  exists(select 1 from public.room_participants rp where rp.room_id = id and rp.user_id = auth.uid())
);
create policy "Users can create rooms" on public.listening_rooms for insert with check (auth.uid() = host_id);
create policy "Host can update room" on public.listening_rooms for update using (auth.uid() = host_id);
create policy "Host can delete room" on public.listening_rooms for delete using (auth.uid() = host_id);

-- Room participants
create policy "Room participants viewable" on public.room_participants for select using (
  exists(select 1 from public.listening_rooms r where r.id = room_id and
    (r.host_id = auth.uid() or exists(select 1 from public.room_participants rp2 where rp2.room_id = room_id and rp2.user_id = auth.uid())))
);
create policy "Users can join rooms" on public.room_participants for insert with check (auth.uid() = user_id);
create policy "Users can leave rooms" on public.room_participants for delete using (auth.uid() = user_id);

-- Spotify imports
create policy "Users can view own imports" on public.spotify_imports for select using (auth.uid() = user_id);
create policy "Users can create imports" on public.spotify_imports for insert with check (auth.uid() = user_id);
create policy "Users can update own imports" on public.spotify_imports for update using (auth.uid() = user_id);

-- ================================================
-- SEED DATA — Demo Artists, Albums, Songs
-- ================================================

-- Insert demo artists
insert into public.artists (id, name, bio, image_url, verified, genres) values
  ('a1000000-0000-0000-0000-000000000001', 'Luna Waves', 'Indie pop artist blending lo-fi beats with dreamy vocals.', '/images/artists/luna-waves.jpg', true, ARRAY['indie pop','lo-fi','dream pop']),
  ('a1000000-0000-0000-0000-000000000002', 'Neon Ghost', 'Electronic producer creating cinematic soundscapes.', '/images/artists/neon-ghost.jpg', true, ARRAY['electronic','ambient','synthwave']),
  ('a1000000-0000-0000-0000-000000000003', 'Echo Valley', 'Folk-acoustic duo with rich harmonies.', '/images/artists/echo-valley.jpg', false, ARRAY['folk','acoustic','indie']),
  ('a1000000-0000-0000-0000-000000000004', 'Solar Drift', 'R&B/soul vocalist with jazz influences.', '/images/artists/solar-drift.jpg', true, ARRAY['r&b','soul','jazz']),
  ('a1000000-0000-0000-0000-000000000005', 'Pixel Storm', 'Hip-hop producer and rapper from the digital underground.', '/images/artists/pixel-storm.jpg', true, ARRAY['hip-hop','rap','trap']);

-- Insert demo albums
insert into public.albums (id, title, artist_id, cover_url, release_date, genre) values
  ('b1000000-0000-0000-0000-000000000001', 'Midnight Bloom', 'a1000000-0000-0000-0000-000000000001', '/images/albums/midnight-bloom.jpg', '2024-03-15', 'Indie Pop'),
  ('b1000000-0000-0000-0000-000000000002', 'Digital Horizon', 'a1000000-0000-0000-0000-000000000002', '/images/albums/digital-horizon.jpg', '2024-01-20', 'Electronic'),
  ('b1000000-0000-0000-0000-000000000003', 'Wilderness', 'a1000000-0000-0000-0000-000000000003', '/images/albums/wilderness.jpg', '2023-11-10', 'Folk'),
  ('b1000000-0000-0000-0000-000000000004', 'Golden Hour', 'a1000000-0000-0000-0000-000000000004', '/images/albums/golden-hour.jpg', '2024-02-28', 'R&B'),
  ('b1000000-0000-0000-0000-000000000005', 'Bytecode', 'a1000000-0000-0000-0000-000000000005', '/images/albums/bytecode.jpg', '2024-04-01', 'Hip-Hop');

-- Insert demo songs (using royalty-free audio URLs)
insert into public.songs (id, title, artist_id, album_id, duration, audio_url, cover_url, lyrics, track_number) values
  ('c1000000-0000-0000-0000-000000000001', 'Starlight Dreams', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 213, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '/images/albums/midnight-bloom.jpg', 'Verse 1:\nStarlight falling through the night\nYour eyes like galaxies so bright\nWe dance beneath the silver moon\nThis moment ending all too soon\n\nChorus:\nIn the starlight dreams we fade\nThrough the night that we have made\nHold me close before the dawn\nLet this feeling carry on', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Ocean Breeze', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 187, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', '/images/albums/midnight-bloom.jpg', 'Verse 1:\nWaves crash on the shore at night\nSalt and wind and pale moonlight\nI''ve been thinking about you lately\nWondering if you think of me', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Neon City Lights', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 245, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', '/images/albums/digital-horizon.jpg', 'Verse 1:\nNeon signs flicker in the rain\nEvery colour cuts through the pain\nI walk the streets alone tonight\nGuided by the electric light\n\nChorus:\nNeon city lights, leading me home\nNeon city lights, never alone', 1),
  ('c1000000-0000-0000-0000-000000000004', 'Digital Rain', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 198, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', '/images/albums/digital-horizon.jpg', 'Verse 1:\nData streams cascade like waterfalls\nBits and bytes behind these walls\nConnection lost but signal found\nEchoes of a digital sound', 2),
  ('c1000000-0000-0000-0000-000000000005', 'Mountain Song', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 220, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', '/images/albums/wilderness.jpg', 'Verse 1:\nI climbed the mountain just to see\nThe world below spread out for me\nThe valleys green, the rivers bright\nEverything just feels so right', 1),
  ('c1000000-0000-0000-0000-000000000006', 'Golden Afternoon', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 231, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', '/images/albums/golden-hour.jpg', 'Verse 1:\nGolden light is falling down\nSlowing turning, spinning round\nYour laughter is the sweetest sound\nIn this moment that we''ve found', 1),
  ('c1000000-0000-0000-0000-000000000007', 'Byte Me', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005', 195, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', '/images/albums/bytecode.jpg', 'Verse 1:\nI code in the night, compile at dawn\nZero to hero before the morn\nMy flows algorithmic, verses compiled\nSpit bars in hex, going wild\n\nChorus:\nByte me if you can\nDebugger in my hand\nRunning scripts all night\nUntil the code is right', 1),
  ('c1000000-0000-0000-0000-000000000008', 'Midnight Drive', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 203, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', '/images/albums/midnight-bloom.jpg', 'Verse 1:\nWindows down at 2am\nHoping this road never ends\nHeadlights cut through velvet dark\nJust us, the night, and beating hearts', 3),
  ('c1000000-0000-0000-0000-000000000009', 'Synthwave Sunrise', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 267, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', '/images/albums/digital-horizon.jpg', 'Instrumental track featuring lush synthesizers and driving drums.', 3),
  ('c1000000-0000-0000-0000-000000000010', 'River Road', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 241, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', '/images/albums/wilderness.jpg', 'Verse 1:\nI followed the river south and west\nLooking for some well-deserved rest\nThe stones and water told their tales\nOf those who walked these winding trails', 2);
