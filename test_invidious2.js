const instances = [
  'https://invidious.perennialte.ch',
  'https://yewtu.be',
  'https://vid.puffyan.us',
  'https://invidious.nerdvpn.de',
  'https://inv.tux.pizza'
];

async function test() {
  const id = 'dQw4w9WgXcQ';
  for (const instance of instances) {
    try {
      console.log('Testing', instance);
      const res = await fetch(`${instance}/api/v1/videos/${id}`);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      const format = data.formatStreams.find(f => f.type.startsWith('audio/mp4')) || data.adaptiveFormats.find(f => f.type.startsWith('audio/mp4') || f.type.startsWith('audio/webm'));
      if (format && format.url) {
        console.log('Success on', instance, ':', format.url.substring(0, 50) + '...');
        return;
      }
    } catch (err) {
      console.log('Failed', instance, err.message);
    }
  }
}
test();
