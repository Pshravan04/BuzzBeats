async function test() {
  const FETCH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
  };
  const API = 'https://www.jiosaavn.com/api.php';
  try {
    const pdUrl = `${API}?__call=playlist.getDetails&listid=156710699&_format=json&_marker=0&ctx=web6dot0`;
    const pdRes = await fetch(pdUrl, { headers: FETCH_HEADERS });
    const pdJson = await pdRes.json();
    if(pdJson.list && pdJson.list.length > 0) {
       console.log(JSON.stringify(pdJson.list[0], null, 2));
    }
  } catch(e) { console.error(e); }
}
test();
