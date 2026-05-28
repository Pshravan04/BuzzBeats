async function test() {
  const FETCH_HEADERS = { 'User-Agent': 'Mozilla/5.0' };
  const API = 'https://www.jiosaavn.com/api.php';
  
  try {
    const artistUrl = `${API}?__call=artist.getArtistPageDetails&artistId=459320&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(artistUrl, { headers: FETCH_HEADERS });
    const json = await res.json();
    console.log("ARTIST:", json.name, "songs:", json.topSongs?.length);
  } catch(e) { console.error(e); }
}
test();
