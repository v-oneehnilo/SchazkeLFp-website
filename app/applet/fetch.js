const https = require('https');
https.get('https://easylink.cc/ogofo1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
