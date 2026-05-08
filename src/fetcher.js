const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      rejectUnauthorized: false,
      timeout: 30000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}: ${url}`));
      }
      resolve(res);
    });
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout: ${url}`));
    });
    req.on('error', reject);
  });
}

function extractTitle(html, fallback = '') {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : fallback;
}

async function fetchFromUrl(url) {
  const res = await httpGet(url);
  return new Promise((resolve, reject) => {
    const chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => {
      const html = Buffer.concat(chunks).toString('utf8');
      resolve({
        html,
        url,
        title: extractTitle(html),
        mode: 'url',
      });
    });
    res.on('error', reject);
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

  return {
    html,
    path: resolved,
    title: extractTitle(html, htmlFile),
    resourceDir: fs.existsSync(resourceDir) ? resourceDir : null,
    htmlDir,
    htmlFile,
    mode: 'local',
  };
}

module.exports = { fetchFromUrl, fetchFromLocal, httpGet };
