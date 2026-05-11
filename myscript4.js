import https from 'https';

https.get('https://easylink.cc/assets/index-1b2c28f6.js', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const endpoints = data.match(/['"]\/[a-zA-Z0-9_\-\/]+['"]/g);
    if (endpoints) {
      console.log('Endpoints:', [...new Set(endpoints)].filter(e => e.includes('api') || e.includes('file') || e.includes('link')));
    }
  });
});
