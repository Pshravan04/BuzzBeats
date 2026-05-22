import type { Metadata } from 'next';
import { getTrendingSongs, searchSongs } from '@/lib/api/jiosaavn';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Home — Discover Music',
  description: 'Discover new music, pick up where you left off, and explore recommendations just for you.',
};

export default async function HomePage() {
  // Fetch real data from JioSaavn API concurrently
  const [trendingSongs, popularHits, newReleases] = await Promise.all([
    getTrendingSongs(),
    searchSongs('popular', 10),
    searchSongs('new release', 10)
  ]);

  return (
    <HomeClient
      trendingSongs={trendingSongs}
      popularHits={popularHits}
      newReleases={newReleases}
    />
  );
}
