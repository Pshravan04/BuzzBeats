const instances = [
  'https://vid.puffyan.us',
  'https://invidious.jing.rocks',
  'https://inv.tux.pizza',
  'https://invidious.nerdvpn.de',
  'https://invidious.flokinet.to'
];

async function test() {
  for (let base of instances) {
    try {
      console.log('Testing', base);
      const searchUrl = `${base}/api/v1/search?q=khat`;
      const res = await fetch(searchUrl, { signal: AbortSignal.timeout(5000) });
      console.log(' -> Search status:', res.status);
      if (res.ok) {
        const results = await res.json();
        if (results.length > 0) {
          const videoId = results[0].videoId;
          console.log(' -> Found video:', videoId);
          
          const videoUrl = `${base}/api/v1/videos/${videoId}`;
          const vidRes = await fetch(videoUrl, { signal: AbortSignal.timeout(5000) });
          console.log(' -> Video status:', vidRes.status);
          
          if (vidRes.ok) {
            const videoData = await vidRes.json();
            const audioFormats = videoData.adaptiveFormats?.filter(f => f.type.includes('audio'));
            if (audioFormats && audioFormats.length > 0) {
              console.log(' -> Audio URL:', audioFormats[0].url.substring(0, 80) + '...');
              return; // Success!
            }
          }
        }
      }
    } catch (e) {
      console.log(' -> ERROR:', e.message);
    }
  }
}
test();
