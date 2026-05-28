async function test() {
  const FETCH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
  };

  const API = 'https://www.jiosaavn.com/api.php';
  
  try {
    console.log("=== PLAYLISTS ===");
    const pUrl = `${API}?__call=search.getPlaylistResults&q=workout&n=2&p=1&_format=json&_marker=0&ctx=web6dot0`;
    const pRes = await fetch(pUrl, { headers: FETCH_HEADERS });
    const pJson = await pRes.json();
    console.log(JSON.stringify(pJson.results, null, 2));

    console.log("\n=== ARTISTS ===");
    const aUrl = `${API}?__call=search.getArtistResults&q=arijit&n=2&p=1&_format=json&_marker=0&ctx=web6dot0`;
    const aRes = await fetch(aUrl, { headers: FETCH_HEADERS });
    const aJson = await aRes.json();
    console.log(JSON.stringify(aJson.results, null, 2));
    
    console.log("\n=== PLAYLIST DETAILS ===");
    if (pJson.results && pJson.results.length > 0) {
      const pid = pJson.results[0].id;
      const pdUrl = `${API}?__call=playlist.getDetails&listid=${pid}&_format=json&_marker=0&ctx=web6dot0`;
      const pdRes = await fetch(pdUrl, { headers: FETCH_HEADERS });
      const pdJson = await pdRes.json();
      console.log(pdJson.title, pdJson.listname);
    }
  } catch(e) { console.error(e); }
}
test();
