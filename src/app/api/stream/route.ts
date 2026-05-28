import { NextResponse } from 'next/server';
import { getSongDetails, searchSongs } from '@/lib/api/jiosaavn';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const queryTitle = searchParams.get('title');
  const queryArtist = searchParams.get('artist');

  if (!id && !queryTitle) {
    return NextResponse.json({ error: 'Missing id or title parameter' }, { status: 400 });
  }

  try {
    // If we have an ID that looks like a JioSaavn ID (usually alphanumeric, sometimes longer)
    if (id && !queryTitle) {
       const details = await getSongDetails(id);
       if (details && details.audio_url) {
           return NextResponse.redirect(details.audio_url);
       }
    }

    // If we have a title (e.g. from an imported Spotify playlist), try to find it on JioSaavn
    const videoTitle = queryTitle || '';
    const videoArtist = queryArtist || '';

    if (videoTitle) {
      try {
        const query = `${videoTitle} ${videoArtist}`.trim();
        const jioResults = await searchSongs(query, 5);
        if (jioResults && jioResults.length > 0) {
          // Find the best match
          const bestJioMatch = jioResults.find(r => 
            r.title.toLowerCase() === videoTitle.toLowerCase() || 
            r.title.toLowerCase().includes(videoTitle.toLowerCase())
          ) || jioResults[0];

          if (bestJioMatch && bestJioMatch.audio_url) {
            console.log('Stream matched on JioSaavn:', query, '->', bestJioMatch.title);
            return NextResponse.redirect(bestJioMatch.audio_url);
          }
        }
      } catch (jioErr) {
        console.warn('JioSaavn search failed:', jioErr);
      }
    }

    return NextResponse.json({ error: 'No streamable format found on JioSaavn' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching stream:', error);
    return NextResponse.json({ error: 'Failed to fetch stream' }, { status: 500 });
  }
}
