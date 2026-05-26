const play = require('play-dl');

async function test() {
  try {
    const stream = await play.stream('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log('Success:', stream.url);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
