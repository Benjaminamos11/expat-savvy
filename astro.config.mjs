import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from "@astrojs/react";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { onBuildComplete } from './src/scripts/build-hooks.js';

export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    sitemap(),
    mdx()
  ],
  site: 'https://expat-savvy.ch',
  compressHTML: true,
  build: {
    inlineStylesheets: 'always'
  },
  vite: {
    build: {
      cssCodeSplit: false,
      assetsInlineLimit: 4096,
    },
    ssr: {
      noExternal: ['@fontsource/inter']
    }
  },
  hooks: {
    'astro:build:done': onBuildComplete
  }
});