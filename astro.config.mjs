// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';

import { gitLastMod } from './src/lib/git-dates.mjs';

function lastmodForUrl(url) {
  const pathname = new URL(url).pathname;
  if (pathname === '/') return gitLastMod('src/pages/index.astro');
  if (pathname === '/about/') return gitLastMod('src/pages/about.astro');
  if (pathname === '/flavors/') return gitLastMod('src/content/flavors.mdx');
  if (pathname === '/primer/') return gitLastMod('src/content/primer.mdx');
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
    rehypePlugins: [rehypeMathjax],
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
