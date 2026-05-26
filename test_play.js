const play = require("play-dl");
async function test() {
  const res = await play.search("Arijit Singh", { source: { youtube: "video" }, limit: 5 });
  console.log(JSON.stringify(res, null, 2));
}
test();
