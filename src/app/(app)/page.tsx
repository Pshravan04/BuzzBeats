import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Home — Discover Music',
  description: 'Discover new music, pick up where you left off, and explore recommendations just for you.',
};

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch featured songs, recent releases, etc.
  const { data: songs } = await supabase
    .from('songs')
    .select('*, artist:artists(*), album:albums(*)')
    .order('play_count', { ascending: false })
    .limit(20);

  const { data: artists } = await supabase
    .from('artists')
    .select('*')
    .order('follower_count', { ascending: false })
    .limit(10);

  const { data: albums } = await supabase
    .from('albums')
    .select('*, artist:artists(*)')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <HomeClient
      featuredSongs={songs ?? []}
      trendingArtists={artists ?? []}
      newReleases={albums ?? []}
    />
  );
}
