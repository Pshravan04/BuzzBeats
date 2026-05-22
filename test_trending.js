async function test() {
  const searchUrl = `https://www.jiosaavn.com/api.php?__call=webapi.get&token=8MT-LGlEbsc_&type=playlist&p=1&n=20&includeMetaTags=0&ctx=web6dot0&api_version=4&_format=json&_marker=0`;
  const res = await fetch(searchUrl);
  const text = await res.text();
  console.log('Trending response:', text.substring(0, 500));
}
test();
