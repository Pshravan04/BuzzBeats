async function test() {
  try {
    const { SaavnAPI } = require('saavnapi');
    console.log('Testing saavnapi...');
    // We don't know the exact syntax of saavnapi, let's try to inspect it
    console.log(Object.keys(require('saavnapi')));
  } catch (e) {
    console.log('saavnapi error:', e.message);
  }

  try {
    const saavnLabs = require('@saavn-labs/sdk');
    console.log('Testing @saavn-labs/sdk...');
    console.log(Object.keys(saavnLabs));
  } catch (e) {
    console.log('@saavn-labs/sdk error:', e.message);
  }
}
test();
