import type { Metadata } from 'next';
import { getTrendingSongs, searchSongs } from '@/lib/api/jiosaavn';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Home — Discover Music',
  description: 'Discover new music, pick up where you left off, and explore recommendations just for you.',
};

export default async function HomePage() {
  // Fetch real data from JioSaavn API
  const trendingSongs = await getTrendingSongs();
  // Fetch some specific popular artists by searching for a popular term
  const popularHits = await searchSongs('popular', 10);
  const newReleases = await searchSongs('new release', 10);

  return (
    <HomeClient
      trendingSongs={trendingSongs}
      popularHits={popularHits}
      newReleases={newReleases}
    />
  );
}
