const YTMusic = require("ytmusic-api");
async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  const searchResults = await ytmusic.search("Arijit Singh");
  console.log(JSON.stringify(searchResults.slice(0, 3), null, 2));
}
test();
