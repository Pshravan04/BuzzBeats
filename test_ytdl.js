const ytdl = require('@distube/ytdl-core');

async function test() {
  try {
    const info = await ytdl.getInfo('dQw4w9WgXcQ'); // Rick roll video ID
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
    console.log('Success:', format.url);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
