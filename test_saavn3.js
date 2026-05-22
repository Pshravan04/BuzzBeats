const api = require('saavnapi').default;
async function test() {
  try {
    const res = await api.search.songs('khat');
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
