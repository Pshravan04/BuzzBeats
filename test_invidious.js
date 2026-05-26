async function test() {
  try {
    const res = await fetch('https://vid.puffyan.us/api/v1/videos/dQw4w9WgXcQ');
    if (!res.ok) {
        console.log('Error status:', res.status);
    }
    const text = await res.text();
    console.log('Invidious response (first 200 chars):', text.substring(0, 200));
  } catch (err) {
    console.log('Invidious failed', err);
  }
}
test();
