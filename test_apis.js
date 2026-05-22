const urls = [
  'https://saavn-api-2aow.onrender.com/search/songs?query=khat',
  'https://jiosaavn-api-privatecvc2.vercel.app/api/search/songs?query=khat', 
  'https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=khat', 
  'https://saavn.me/search/songs?query=khat',
  'https://pipedapi.kavin.rocks/search?q=khat&filter=music_songs',
  'https://itunes.apple.com/search?term=khat&entity=song&limit=1'
];

async function test() {
  for (let url of urls) {
    try {
      console.log('Testing', url);
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      console.log(' ->', res.status);
      if (res.ok) {
        const text = await res.text();
        console.log(' ->', text.substring(0, 100).replace(/\n/g, ' '));
      }
    } catch (e) {
      console.log(' -> ERROR:', e.message);
    }
  }
}
test();
