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

    // Step 1: Get Basic Info quickly to find Title and Artist using ytmusic-api for a clean title
    try {
      const YTMusic = (await import('ytmusic-api')).default;
      const ytmusic = new YTMusic();
      await ytmusic.initialize();
      const songDetails = await ytmusic.getSong(id);
      if (songDetails && songDetails.name) {
        videoTitle = songDetails.name;
        videoArtist = songDetails.artist?.name || '';
      }
    } catch (err) {
      console.warn('ytmusic-api failed, falling back to ytdl for title...', err);
      try {
        const basicInfo = await ytdl.getBasicInfo(id);
        videoTitle = basicInfo.videoDetails.title;
        videoArtist = basicInfo.videoDetails.author.name;
      } catch (ytdlErr) {
        console.warn('ytdl getBasicInfo also failed');
      }
    }

    // Step 2: Try to find and redirect to JioSaavn (Fast, reliable, no IP bind)
    if (videoTitle) {
      try {
        const { searchSongs } = await import('@/lib/api/jiosaavn');
        const query = `${videoTitle} ${videoArtist}`.trim();
        const jioResults = await searchSongs(query, 1);
        if (jioResults && jioResults.length > 0 && jioResults[0].audio_url) {
          console.log('Stream matched on JioSaavn:', query);
          return NextResponse.redirect(jioResults[0].audio_url);
        }
      } catch (jioErr) {
        console.warn('JioSaavn search failed:', jioErr);
      }
    }

    // Step 3: If JioSaavn fails (e.g., obscure YouTube cover), fallback to proxying YouTube
    console.log('Falling back to YouTube proxy for:', id);
    try {
      const info = await ytdl.getInfo(id);
      let format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
      if (!format || !format.url) format = ytdl.chooseFormat(info.formats, { filter: 'audio' }) || format;
      if (!format || !format.url) format = info.formats[0];

      if (format && format.url) {
        // Proxy the stream so the client doesn't get a 403 IP-Mismatch error from YouTube
        const proxyRes = await fetch(format.url);
        if (!proxyRes.ok) {
           throw new Error(`YouTube returned status ${proxyRes.status}`);
        }
        return new NextResponse(proxyRes.body, {
          headers: {
            'Content-Type': format.mimeType || 'audio/mp4',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    } catch (ytErr) {
      console.error('YouTube proxy failed:', ytErr);
    }

    return NextResponse.json({ error: 'No streamable format found across all providers' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching stream:', error);
    return NextResponse.json({ error: 'Failed to fetch stream' }, { status: 500 });
  }
}
