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
    const info = await ytdl.getInfo(id);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
    
    if (!format || !format.url) {
      return NextResponse.json({ error: 'No audio format found' }, { status: 404 });
    }

    // Redirect directly to the youtube googlevideo audio stream URL
    return NextResponse.redirect(format.url);
  } catch (error) {
    console.error('Error fetching stream:', error);
    return NextResponse.json({ error: 'Failed to fetch stream' }, { status: 500 });
  }
}
