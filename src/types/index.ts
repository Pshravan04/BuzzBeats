// ==========================================
// BuzzBeats — Core Type Definitions
// ==========================================

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  theme: Theme;
  spotify_connected: boolean;
  created_at: string;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  image_url?: string;
  verified: boolean;
  follower_count: number;
  genres: string[];
}

export interface Album {
  id: string;
  title: string;
  artist_id: string;
  artist?: Artist;
  cover_url: string;
  release_date: string;
  genre: string;
  song_count: number;
  songs?: Song[];
}

export interface Song {
  id: string;
  title: string;
  artist_id: string;
  artist?: Artist;
  album_id: string;
  album?: Album;
  duration: number; // seconds
  audio_url: string;
  cover_url: string;
  lyrics?: string;
  play_count: number;
  is_liked?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  owner_id: string;
  owner?: User;
  cover_url?: string;
  is_public: boolean;
  is_collaborative: boolean;
  description?: string;
  song_count: number;
  songs?: PlaylistSong[];
  collaborators?: PlaylistCollaborator[];
  created_at: string;
  updated_at: string;
}

export interface PlaylistSong {
  playlist_id: string;
  song_id: string;
  song: Song;
  position: number;
  added_by: string;
  added_at: string;
}

export interface PlaylistCollaborator {
  playlist_id: string;
  user_id: string;
  user: User;
  role: 'editor' | 'viewer';
  joined_at: string;
}

export interface ListeningRoom {
  id: string;
  name?: string;
  playlist_id?: string;
  playlist?: Playlist;
  host_id: string;
  host?: User;
  current_song_id?: string;
  current_song?: Song;
  position_ms: number;
  is_playing: boolean;
  created_at: string;
  participants?: User[];
}

export interface LikedSong {
  user_id: string;
  song_id: string;
  song: Song;
  liked_at: string;
}

export interface ListeningHistory {
  user_id: string;
  song_id: string;
  song: Song;
  played_at: string;
  duration_played: number;
}

// ==========================================
// Player State
// ==========================================

export interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  progress: number; // 0-1
  duration: number; // seconds
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
  isLoading: boolean;
}

export interface PlayerActions {
  play: (song: Song, queue?: Song[]) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playQueue: (songs: Song[], startIndex?: number) => void;
}

// ==========================================
// Theme
// ==========================================

export type Theme = 'blue' | 'purple' | 'grey' | 'pink' | 'green';

// ==========================================
// Search
// ==========================================

export interface SearchResults {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

// ==========================================
// Spotify Import
// ==========================================

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description?: string;
  images: { url: string }[];
  tracks: { total: number };
  owner: { display_name: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  preview_url?: string;
}

export interface ImportStatus {
  playlistId: string;
  playlistName: string;
  total: number;
  imported: number;
  status: 'pending' | 'importing' | 'done' | 'error';
  error?: string;
}

// ==========================================
// Room / Realtime
// ==========================================

export interface RoomPresence {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  online_at: string;
}

export interface RoomState {
  song_id: string | null;
  position_ms: number;
  is_playing: boolean;
  updated_by: string;
  updated_at: number;
}
