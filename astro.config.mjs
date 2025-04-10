import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from "@astrojs/react";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    sitemap(),
    mdx()
  ],
  site: 'https://expat-savvy.ch',
  compressHTML: true,
  vite: {
    build: {
      cssCodeSplit: false,
      assetsInlineLimit: 4096,
      inlineStylesheets: 'always',
    },
    ssr: {
        noExternal: ['@fontsource/inter']
    }
  }
});
