import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    let videoTitle = '';
    let videoArtist = '';

    // 1. Try ytdl-core first
    try {
      const info = await ytdl.getInfo(id);
      videoTitle = info.videoDetails.title;
      videoArtist = info.videoDetails.author.name;

      let format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
      if (!format || !format.url) format = ytdl.chooseFormat(info.formats, { filter: 'audio' }) || format;
      if (!format || !format.url) format = info.formats[0];
      
      if (format && format.url) {
        return NextResponse.redirect(format.url);
      }
    } catch (err) {
      console.warn('ytdl-core failed, trying fallback to JioSaavn...', err);
    }

    // 2. Fallback to JioSaavn if ytdl-core fails
    if (videoTitle) {
      try {
        const { searchSongs } = await import('@/lib/api/jiosaavn');
        const query = `${videoTitle} ${videoArtist}`.trim();
        const jioResults = await searchSongs(query, 1);
        if (jioResults && jioResults.length > 0 && jioResults[0].audio_url) {
          console.log('JioSaavn fallback successful for:', query);
          return NextResponse.redirect(jioResults[0].audio_url);
        }
      } catch (fallbackErr) {
        console.warn('JioSaavn fallback failed:', fallbackErr);
      }
    }

    // 3. If we don't have the title (ytdl failed entirely), we can try to fetch title using ytmusic-api
    if (!videoTitle) {
       try {
         const YTMusic = (await import('ytmusic-api')).default;
         const ytmusic = new YTMusic();
         await ytmusic.initialize();
         const songDetails = await ytmusic.getSong(id);
         if (songDetails && songDetails.name) {
           const { searchSongs } = await import('@/lib/api/jiosaavn');
           const query = `${songDetails.name} ${songDetails.artist?.name || ''}`.trim();
           const jioResults = await searchSongs(query, 1);
           if (jioResults && jioResults.length > 0 && jioResults[0].audio_url) {
             console.log('JioSaavn fallback (via ytmusic-api) successful for:', query);
             return NextResponse.redirect(jioResults[0].audio_url);
           }
         }
       } catch (fallbackErr2) {
         console.warn('JioSaavn fallback via ytmusic failed:', fallbackErr2);
       }
    }

    return NextResponse.json({ error: 'No streamable format found across all providers' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching stream:', error);
    return NextResponse.json({ error: 'Failed to fetch stream' }, { status: 500 });
  }
}
