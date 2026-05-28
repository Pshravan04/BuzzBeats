import YTMusic from 'ytmusic-api';

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  const results = await ytmusic.searchPlaylists('Global Top 50');
  console.log('Search Results:', results.slice(0, 1));
  const playlist = await ytmusic.getPlaylist(results[0].playlistId);
  console.log('Playlist details:', JSON.stringify(playlist, null, 2));
}

test().catch(console.error);
