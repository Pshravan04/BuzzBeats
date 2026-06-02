import type { Metadata } from 'next';
import { getTrendingSongs, searchSongs, getTrendingPlaylists, getTrendingArtists } from '@/lib/api/jiosaavn';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Home — Discover Music',
  description: 'Discover new music, pick up where you left off, and explore recommendations just for you.',
};

export default async function HomePage() {
  const [trendingSongs, popularHits, newReleases, playlists, artists] = await Promise.all([
    getTrendingSongs(),
    searchSongs('popular', 10),
    searchSongs('new release', 10),
    getTrendingPlaylists(8),
    getTrendingArtists(8),
  ]);

  return (
    <HomeClient
      trendingSongs={trendingSongs}
      popularHits={popularHits}
      newReleases={newReleases}
      playlists={playlists}
      artists={artists}
    />
  );
}
