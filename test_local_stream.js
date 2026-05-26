const http = require('http');

async function test() {
  const YTMusic = (await import('ytmusic-api')).default;
  const api = new YTMusic();
  await api.initialize();
  const searchResults = await api.searchSongs('Khat Navjot Ahuja');
  const song = searchResults[0];
  console.log('Testing ID:', song.videoId);

  // Instead of hitting the dev server, let's just run the exact logic of the route!
  const ytdl = require('@distube/ytdl-core');
  try {
    const basicInfo = await ytdl.getBasicInfo(song.videoId);
    console.log('ytdl basic info success:', basicInfo.videoDetails.title);
  } catch (err) {
    console.log('ytdl getBasicInfo failed!', err.message);
  }
}
test();
