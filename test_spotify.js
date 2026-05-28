const http = require('http');

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/import/spotify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M' })
    });
    const text = await res.text();
    console.log(res.status, text);
  } catch (err) {
    console.error(err);
  }
}
test();
