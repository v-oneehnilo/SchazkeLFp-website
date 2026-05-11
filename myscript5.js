import https from 'https';

https.get('https://easylink.cc/api/file/ogofo1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('File:', res.statusCode, data));
});
https.get('https://easylink.cc/api/v1/file/ogofo1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('V1:', res.statusCode, data));
});
https.get('https://easylink.cc/api/link/ogofo1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Link:', res.statusCode, data));
});
