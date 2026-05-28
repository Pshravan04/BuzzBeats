async function test() {
  const JIOSAAVN_API = 'https://www.jiosaavn.com/api.php';
  const query = "Khat Navjot Ahuja";
  const searchUrl = `${JIOSAAVN_API}?__call=search.getResults&q=${encodeURIComponent(query)}&n=1&p=1&_format=json&_marker=0&ctx=web6dot0`;
  const res = await fetch(searchUrl);
  const json = await res.json();
  console.log(json.results[0]);
}
test();
