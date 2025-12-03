const https = require('https');

const url = 'http://localhost:3000/sitemap.xml';

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Sitemap fetched successfully!');
    console.log('Length:', data.length, 'characters');

    // Check for unwanted script tag
    if (data.includes('chrome-extension://hoklmmgfnpapgjgcpechhaamimifchmp/frame_ant/frame_ant.js')) {
      console.log('❌ ERROR: Unwanted script tag found!');
    } else {
      console.log('✅ GOOD: No unwanted script tags found');
    }

    // Check for proper XML structure
    if (data.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
      console.log('✅ GOOD: Proper XML declaration');
    } else {
      console.log('❌ ERROR: Missing or incorrect XML declaration');
    }

    if (data.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
      console.log('✅ GOOD: Proper urlset declaration');
    } else {
      console.log('❌ ERROR: Missing or incorrect urlset declaration');
    }

    // Show first few lines
    console.log('\n--- First 10 lines ---');
    const lines = data.split('\n');
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }

    // Count URLs
    const urlMatches = data.match(/<url>/g);
    console.log(`\n📊 Total URLs in sitemap: ${urlMatches ? urlMatches.length : 0}`);
  });

}).on('error', (err) => {
  console.error('Error fetching sitemap:', err.message);
});


