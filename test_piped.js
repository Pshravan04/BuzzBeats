async function test() {
  const res = await fetch('https://pipedapi.kavin.rocks/streams/dQw4w9WgXcQ');
  const data = await res.json();
  if (data.audioStreams && data.audioStreams.length > 0) {
    console.log('Success Piped:', data.audioStreams[0].url);
  } else {
    console.log('Failed or no streams:', data);
  }
}
test();
