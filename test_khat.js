async function test() {
  try {
    const query = 'Khat Navjot Ahuja';
    const JIOSAAVN_API = 'https://www.jiosaavn.com/api.php';
    const searchUrl = `${JIOSAAVN_API}?__call=search.getResults&q=${encodeURIComponent(query)}&n=1&p=1&_format=json&_marker=0&ctx=web6dot0`;
    
    const FETCH_HEADERS = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/plain, */*'
    };
    
    const res = await fetch(searchUrl, { headers: FETCH_HEADERS });
    const json = await res.json();
    console.log('JioSaavn search results count:', json.results ? json.results.length : 0);
    
    if (json.results && json.results.length > 0) {
      console.log('JioSaavn found:', json.results[0].title);
      const pids = json.results[0].id;
      const detailsUrl = `${JIOSAAVN_API}?__call=song.getDetails&pids=${pids}&_format=json&_marker=0&ctx=web6dot0`;
      const dRes = await fetch(detailsUrl, { headers: FETCH_HEADERS });
      const dJson = await dRes.json();
      const track = dJson.songs[0];
      console.log('JioSaavn track encrypted url:', track.encrypted_media_url ? 'Yes' : 'No');
    } else {
      console.log('JioSaavn fallback failed to find the song');
    }
  } catch (err) {
    console.error('Fatal error:', err);
  }
}
test();
