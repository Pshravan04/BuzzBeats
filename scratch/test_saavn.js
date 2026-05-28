async function test() {
  try {
    const res = await fetch('https://saavn.dev/api/search/songs?query=Believer');
    const data = await res.json();
    console.log(JSON.stringify(data.data.results.slice(0, 2), null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
