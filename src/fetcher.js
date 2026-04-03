const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

function fetchFromUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const options = {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      rejectUnauthorized: false,
    };
    client.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchFromUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}: ${url}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const html = Buffer.concat(chunks).toString('utf8');
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        resolve({
          html,
          url,
          title: titleMatch ? titleMatch[1].trim() : '',
          mode: 'url',
        });
      });
    }).on('error', reject);
  });
}

function fetchFromLocal(htmlPath) {
  const resolved = path.resolve(htmlPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`HTML file not found: ${resolved}`);
  }
  const html = fs.readFileSync(resolved, 'utf8');
  const htmlFile = path.basename(resolved, '.html');
  const htmlDir = path.dirname(resolved);
  const resourceDir = path.join(htmlDir, htmlFile + '_files');
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

  return {
    html,
    path: resolved,
    title: titleMatch ? titleMatch[1].trim() : htmlFile,
    resourceDir: fs.existsSync(resourceDir) ? resourceDir : null,
    htmlDir,
    htmlFile,
    mode: 'local',
  };
}

module.exports = { fetchFromUrl, fetchFromLocal };
