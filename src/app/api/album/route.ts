import { NextResponse } from 'next/server';
import { getAlbumDetails } from '@/lib/api/jiosaavn';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Album ID parameter is required' }, { status: 400 });
  }

  try {
    const result = await getAlbumDetails(id);
    if (!result) {
      return NextResponse.json({
        album: null,
        songs: [],
      });
    }

    return NextResponse.json({
      album: result.album,
      songs: result.songs,
    });
  } catch (error) {
    console.error('Album API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch album details' }, { status: 500 });
  }
}
