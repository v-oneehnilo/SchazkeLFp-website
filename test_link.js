import https from 'https';

https.get('https://easylink.cc/ogofo1', (res) => {
  console.log(res.statusCode);
  console.log(res.headers);
});
