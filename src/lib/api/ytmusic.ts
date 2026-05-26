import YTMusic from 'ytmusic-api';

let ytmusic: YTMusic | null = null;
let initPromise: Promise<void> | null = null;

export async function getYTMusic() {
  if (ytmusic) return ytmusic;
  
  if (!initPromise) {
    ytmusic = new YTMusic();
    initPromise = ytmusic.initialize().catch(err => {
      ytmusic = null;
      initPromise = null;
      throw err;
    });
  }
  
  await initPromise;
  return ytmusic!;
}

export async function searchYT(query: string, type?: 'SONG' | 'ARTIST' | 'PLAYLIST') {
  const yt = await getYTMusic();
  
  if (type === 'SONG') {
    return yt.searchSongs(query);
  }
  if (type === 'ARTIST') {
    return yt.searchArtists(query);
  }
  if (type === 'PLAYLIST') {
    return yt.searchPlaylists(query);
  }
  
  // Mixed results
  return yt.search(query);
}

export async function getArtistDetails(artistId: string) {
  const yt = await getYTMusic();
  return yt.getArtist(artistId);
}

export async function getPlaylistDetails(playlistId: string) {
  const yt = await getYTMusic();
  return yt.getPlaylist(playlistId);
}
