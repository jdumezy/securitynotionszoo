// Pings the IndexNow API (used by Bing, DuckDuckGo, Yandex) with the URLs
// from the freshly-built sitemap. Runs after `astro build`.
//
// Skips silently unless the `NETLIFY` env var is set, so local builds do not
// spam the API. To test locally, run: NETLIFY=1 npm run build
//
// The key must match the filename (minus `.txt`) of the file in `public/` —
// see public/<KEY>.txt. IndexNow verifies ownership by fetching that file.

import fs from 'node:fs';

const HOST = 'securitynotionszoo.com';
const KEY = 'd4f9a2e8c1b7f3a6d9e5c2b8f4a7d1e3';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_PATH = 'dist/sitemap-0.xml';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

function log(msg) {
  console.log(`[indexnow] ${msg}`);
}

if (!process.env.NETLIFY) {
  log('Skipping: not a Netlify build (set NETLIFY=1 to force).');
  process.exit(0);
}

if (!fs.existsSync(SITEMAP_PATH)) {
  log(`Sitemap not found at ${SITEMAP_PATH}, skipping.`);
  process.exit(0);
}

const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);

if (urls.length === 0) {
  log('No URLs found in sitemap, skipping.');
  process.exit(0);
}

const body = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
};

try {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  if (res.status === 200 || res.status === 202) {
    log(`Submitted ${urls.length} URLs (status ${res.status}).`);
  } else {
    const text = await res.text().catch(() => '');
    log(`Submission returned status ${res.status}: ${text}`);
  }
} catch (err) {
  // Never fail the build on network issues.
  log(`Network error: ${err?.message ?? err}`);
}
