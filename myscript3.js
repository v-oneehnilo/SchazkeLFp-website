import https from 'https';

https.get('https://easylink.cc/assets/index-1b2c28f6.js', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const apiMatches = data.match(/baseURL:\s*["'][^"']+["']/g);
    console.log('baseURL:', apiMatches);
    const endpointMatches = data.match(/url:\s*["'][^"']+["']/g);
    console.log('url:', endpointMatches ? endpointMatches.slice(0, 20) : null);
  });
});
