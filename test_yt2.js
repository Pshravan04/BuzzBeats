const YTMusic = require("ytmusic-api");
async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  const searchResults = await ytmusic.searchPlaylists("arijit singh");
  const artistRes = await ytmusic.searchArtists("arijit singh");
  console.log("Playlists:", JSON.stringify(searchResults.slice(0, 1), null, 2));
  console.log("Artists:", JSON.stringify(artistRes.slice(0, 1), null, 2));
  
  if (artistRes.length > 0) {
    const artistDetails = await ytmusic.getArtist(artistRes[0].artistId);
    console.log("Artist Details:", JSON.stringify(artistDetails, null, 2));
  }
}
test();
