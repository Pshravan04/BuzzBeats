import { NextResponse } from 'next/server';
import { searchSongs } from '@/lib/api/jiosaavn';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 30;

  if (!q) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const results = await searchSongs(q, limit);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch songs', results: [] }, { status: 500 });
  }
}
