import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from "@astrojs/react";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// Development config WITHOUT Netlify adapter
export default defineConfig({
  // Remove server output for development
  // output: 'server',
  // adapter: netlify(),
  integrations: [
    tailwind(),
    react(),
    sitemap({
      filter: (page) => {
        if (page.includes('/404')) return false;
        if (!page.endsWith('/') && !page.match(/\.[^/]+$/)) {
          return false;
        }
        return true;
      },
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      outFile: 'sitemap-auto.xml'
    }),
    mdx()
  ],
  site: 'https://expat-savvy.ch',
  compressHTML: true,
  vite: {
    define: {
      __DEFINES__: JSON.stringify({}),
      'import.meta.env.DEV': JSON.stringify(true)
    },
    optimizeDeps: {
      exclude: []
    },
    build: {
      cssCodeSplit: false,
      assetsInlineLimit: 4096,
      inlineStylesheets: 'always',
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    resolve: {
      alias: {
        '@fontsource': '/node_modules/@fontsource'
      }
    },
    server: {
      strictPort: false,
      host: '0.0.0.0',
      port: 4321,
      fs: {
        strict: false,
        allow: ['/']
      },
      hmr: {
        overlay: true,
        port: 4322
      }
    }
  }
});