import YTMusic from 'ytmusic-api';

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  const videos = await ytmusic.getPlaylistVideos('VLPLgzTt0k8mXzEk586ze4BjvDXR7c-TUSnx');
  console.log('Videos:', JSON.stringify(videos.slice(0, 2), null, 2));
}

test().catch(console.error);
