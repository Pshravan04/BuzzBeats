import { NextResponse } from 'next/server';
import { getPlaylistDetails } from '@/lib/api/jiosaavn';
import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

function formatImageUrl(url: string): string {
  if (!url) return '';
  return url.replace('150x150', '500x500').replace('50x50', '500x500');
}

function decryptUrl(encryptedUrl: string): string {
  try {
    const DES_KEY = '38346591';
    const key = CryptoJS.enc.Utf8.parse(DES_KEY);
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) } as any,
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    return url.replace('_96.mp4', '_320.mp4');
  } catch (err) {
    return '';
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Playlist ID parameter is required' }, { status: 400 });
  }

  try {
    // Check if it's a UUID (Supabase playlist)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
      const { data: pl } = await supabase
        .from('playlists')
        .select('*, owner:profiles(display_name, avatar_url)')
        .eq('id', id)
        .single();
      
      if (!pl) {
        return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
      }
      
      const { data: ps } = await supabase
        .from('playlist_songs')
        .select('*, song:songs(*, artist:artists(*), album:albums(*))')
        .eq('playlist_id', id)
        .order('position');
      
      return NextResponse.json({
        playlist: pl,
        songs: ps?.map(r => r.song) || []
      });
    }

    // Otherwise, fetch from JioSaavn
    const jioData = await getPlaylistDetails(id);
    if (!jioData) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }
    
    const rawSongs = jioData.list || jioData.songs || [];
    
    // Map songs to unified format
    const songs = rawSongs.map((vid: any) => {
        const cover = formatImageUrl(vid.image);
        return {
          id: vid.id,
          title: vid.song?.replace(/&quot;/g, '"')?.replace(/&#039;/g, "'") || vid.title || 'Unknown Title',
          artist_id: vid.primary_artists_id || vid.id,
          artist: { name: vid.primary_artists || vid.singers || 'Unknown Artist' },
          duration: parseInt(vid.duration || '0', 10),
          cover_url: cover || '/images/default-album.jpg',
          audio_url: decryptUrl(vid.encrypted_media_url || ''),
          play_count: 0
        }
    }).filter((s: any) => s.audio_url);

    return NextResponse.json({ 
      playlist: {
        id: jioData.listid || jioData.id,
        name: jioData.listname || jioData.title,
        description: jioData.subtitle_desc || '',
        cover_url: formatImageUrl(jioData.image) || '/images/default-album.jpg',
        owner_id: '',
        owner: { display_name: jioData.username || jioData.firstname || 'JioSaavn' },
        is_public: true,
        is_collaborative: false,
      },
      songs
    });
  } catch (error) {
    console.error('Playlist API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlist details' }, { status: 500 });
  }
}
