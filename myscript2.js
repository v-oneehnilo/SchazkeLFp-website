import https from 'https';

https.get('https://easylink.cc/ogofo1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (match) {
      console.log('Found JS:', match[1]);
      https.get('https://easylink.cc' + match[1], (jsRes) => {
        let jsData = '';
        jsRes.on('data', chunk => jsData += chunk);
        jsRes.on('end', () => {
          console.log('JS fetched, length:', jsData.length);
          const urls = jsData.match(/https?:\/\/[^\s"'`]+/g);
          if (urls) {
             const uniqueUrls = [...new Set(urls)].filter(u => u.includes('api'));
             console.log('API URLs:', uniqueUrls);
          }
        });
      })
    } else {
      console.log('No JS bundle found');
    }
  });
});
