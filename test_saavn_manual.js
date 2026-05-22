const CryptoJS = require("crypto-js");

async function test() {
  try {
    const query = 'believer';
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${query}&n=1&p=1&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(searchUrl);
    const json = await res.json();
    
    const id = json.results[0].id;
    
    const detailUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${id}&_format=json&_marker=0&ctx=web6dot0`;
    const res2 = await fetch(detailUrl);
    const json2 = await res2.json();
    
    const song = json2.songs[0];
    const encryptedUrl = song.encrypted_media_url;
    
    const key = CryptoJS.enc.Utf8.parse("38346591");
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    
    let finalUrl = url.replace('_96.mp4', '_320.mp4');
    console.log('Final URL:', finalUrl);
    
    const mediaRes = await fetch(finalUrl, { method: 'HEAD' });
    console.log('Media URL Status:', mediaRes.status);
  } catch(e) {
    console.error(e);
  }
}
test();
