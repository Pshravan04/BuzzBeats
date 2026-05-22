import { searchSongs, getTrendingSongs } from './src/lib/api/jiosaavn';

async function test() {
  console.log('Testing searchSongs...');
  try {
    const results = await searchSongs('khat', 5);
    console.log('Search Results:', results.length, 'songs found.');
    if (results.length > 0) {
      console.log('First song:', results[0].title, 'Audio:', results[0].audio_url);
    }
  } catch (e) {
    console.error('Error in search:', e);
  }

  console.log('Testing getTrendingSongs...');
  try {
    const trending = await getTrendingSongs();
    console.log('Trending Results:', trending.length, 'songs found.');
  } catch(e) {
    console.error('Error in trending:', e);
  }
}
test();
