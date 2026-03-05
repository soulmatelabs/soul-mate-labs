import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://soulmatelabs.github.io/soul-mate-labs/',
  base: '/soul-mate-labs/',
  integrations: [tailwind(), sitemap()],
  build: {
    inlineStylesheets: 'always'
  }
});
