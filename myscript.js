import https from 'https';

https.get('https://easylink.cc/ogofo1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data.slice(0, 1000)));
});
