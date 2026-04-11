// Build-time helpers that map a source file to its git history dates.
// Used by the sitemap `lastmod` generator and by notion page JSON-LD.

import { execSync } from 'node:child_process';

const buildStart = new Date().toISOString();

export function gitLastMod(filePath) {
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      encoding: 'utf8',
    }).trim();
    return iso || buildStart;
  } catch {
    return buildStart;
  }
}

export function gitFirstMod(filePath) {
  try {
    const out = execSync(`git log --reverse --format=%cI -- "${filePath}"`, {
      encoding: 'utf8',
    }).trim();
    const first = out.split('\n')[0];
    return first || buildStart;
  } catch {
    return buildStart;
  }
}
