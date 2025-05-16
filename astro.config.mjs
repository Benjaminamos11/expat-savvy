import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from "@astrojs/react";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    sitemap({
      filter: (page) => !page.includes('/404'), // Exclude 404 page from sitemap
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      outFile: 'sitemap-auto.xml' // Generate to a different file
    }),
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
    optimizeDeps: {
      exclude: [], // Don't exclude anything specific
    },
    ssr: {
      noExternal: ['@fontsource/inter']
    },
    server: {
      fs: {
        // Allow serving files from one level up (the project directory) and node_modules
        allow: [
          // The project directory (expat-savvy)
          path.resolve(__dirname, '..'),
          // Node modules directory
          path.resolve(__dirname, 'node_modules')
        ]
      }
    }
  }
});
