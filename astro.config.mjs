import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from "@astrojs/react";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    sitemap({
      filter: (page) => {
        // Exclude 404 page from sitemap
        if (page.includes('/404')) return false;
        
        // Ensure all URLs have trailing slashes
        // If the URL doesn't end with a trailing slash and doesn't have a file extension,
        // exclude it from the sitemap as it will cause a redirect
        if (!page.endsWith('/') && !page.match(/\.[^/]+$/)) {
          return false;
        }
        
        return true;
      },
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
    // Simplified resolution for fonts
    resolve: {
      alias: {
        '@fontsource': '/node_modules/@fontsource'
      }
    },
    // Disable strict port check - this helps in development
    server: {
      strictPort: false,
      fs: {
        strict: false,
        allow: ['/']
      },
      hmr: {
        overlay: true
      }
    }
  }
});
