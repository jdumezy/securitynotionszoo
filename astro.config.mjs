// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';

import { gitLastMod } from './src/lib/git-dates.mjs';
import rehypeHeadingIds from './src/lib/rehype-heading-ids.mjs';
import rehypeCrosslink from './src/lib/rehype-crosslink.mjs';
import { glossary } from './src/lib/glossary.mjs';

// Load the acronym → slug map once at config time by parsing each notion
// frontmatter. Keeps the crosslink plugin in sync with the collection
// without duplication.
function loadNotionAcronyms() {
  const dir = 'src/content/notions';
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.mdx')) continue;
    const body = fs.readFileSync(path.join(dir, name), 'utf8');
    const frontmatter = body.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatter) continue;
    const acr = frontmatter[1].match(/^acronym:\s*"(.+)"/m);
    if (acr) out.push({ acronym: acr[1], slug: name.replace(/\.mdx$/, '') });
  }
  return out;
}

const notionAcronyms = loadNotionAcronyms();

const buildStart = new Date().toISOString();

function lastmodForUrl(url) {
  const pathname = new URL(url).pathname;
  if (pathname === '/') return gitLastMod('src/pages/index.astro');
  if (pathname === '/about/') return gitLastMod('src/pages/about.astro');
  if (pathname === '/flavors/') return gitLastMod('src/content/flavors.mdx');
  if (pathname === '/primer/') return gitLastMod('src/content/primer.mdx');
  if (pathname === '/games/') return gitLastMod('src/pages/games/index.astro');
  if (pathname === '/games/quiz/') return gitLastMod('src/pages/games/quiz.astro');
  if (pathname === '/games/reorder/') return gitLastMod('src/pages/games/reorder.astro');
  if (pathname === '/games/designer/') return gitLastMod('src/pages/games/designer.astro');
  if (pathname === '/map/') return gitLastMod('src/pages/map.astro');
  const notionMatch = pathname.match(/^\/notions\/([^/]+)\/?$/);
  if (notionMatch) return gitLastMod(`src/content/notions/${notionMatch[1]}.mdx`);
  return buildStart;
}

// https://astro.build/config
export default defineConfig({
  site: 'https://securitynotionszoo.com',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()]
  },

  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeMathjax,
      rehypeHeadingIds,
      [rehypeCrosslink, { notions: notionAcronyms, glossary }],
    ],
  },

  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/notions/all'),
      serialize(item) {
        item.lastmod = lastmodForUrl(item.url);
        return item;
      },
    }),
  ],
});
