const play = require('play-dl');

async function test() {
  try {
    console.log('Searching YouTube via play-dl...');
    const searchRes = await play.search('khat song', { limit: 1 });
    if (searchRes.length > 0) {
      console.log('Found:', searchRes[0].title);
      console.log('URL:', searchRes[0].url);
      
      console.log('Extracting stream...');
      const stream = await play.stream(searchRes[0].url);
      console.log('Stream URL:', stream.url.substring(0, 100) + '...');
    } else {
      console.log('No results found.');
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
