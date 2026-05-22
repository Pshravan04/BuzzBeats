async function test() {
  const q1 = 'arijit singh';
  const url1 = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(q1)}&n=5&p=1&_format=json&_marker=0&ctx=web6dot0`;
  const r1 = await fetch(url1, { headers: { 'User-Agent': 'Mozilla/5.0' }});
  const j1 = await r1.json();
  console.log('arijit singh songs:', j1.results ? j1.results.map((r:any)=>`${r.title} by ${r.primary_artists}`) : 'no results');
}
test();
