import { NextResponse } from 'next/server';
import { getSongDetails, searchSongs } from '@/lib/api/jiosaavn';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const queryTitle = searchParams.get('title');
  const queryArtist = searchParams.get('artist');

  if (!id && !queryTitle) {
    return NextResponse.json({ error: 'Missing id or title parameter' }, { status: 400 });
  }

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  try {
    // If id is a JioSaavn ID (non-UUID), try direct lookup
    if (id && !isUUID.test(id)) {
      const details = await getSongDetails(id);
      if (details && details.audio_url) {
        return NextResponse.redirect(details.audio_url);
      }
    }

    // If id is a Supabase UUID, look up the song in DB then search JioSaavn
    if (id && isUUID.test(id)) {
      const { data: song } = await supabase
        .from('songs')
        .select('title, artist:artists(name)')
        .eq('id', id)
        .single();

      if (song) {
        const query = `${song.title} ${(song.artist as any)?.name || ''}`.trim();
        const jioResults = await searchSongs(query, 5);
        if (jioResults.length > 0) {
          const match = jioResults.find(r =>
            r.title.toLowerCase() === song.title.toLowerCase()
          ) || jioResults[0];
          if (match.audio_url) {
            return NextResponse.redirect(match.audio_url);
          }
        }
      }
    }

    // Fallback: search by title/artist if provided
    if (queryTitle) {
      const query = `${queryTitle} ${queryArtist || ''}`.trim();
      const jioResults = await searchSongs(query, 5);
      if (jioResults.length > 0) {
        const match = jioResults.find(r =>
          r.title.toLowerCase() === queryTitle.toLowerCase() ||
          r.title.toLowerCase().includes(queryTitle.toLowerCase())
        ) || jioResults[0];
        if (match.audio_url) {
          return NextResponse.redirect(match.audio_url);
        }
      }
    }

    return NextResponse.json({ error: 'No streamable format found on JioSaavn' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching stream:', error);
    return NextResponse.json({ error: 'Failed to fetch stream' }, { status: 500 });
  }
}
