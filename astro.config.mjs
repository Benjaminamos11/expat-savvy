import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from "@astrojs/react";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  integrations: [
    react(),
    tailwind(),
    sitemap({
      filter: (page) => {
        // Exclude 404 page from sitemap
        if (page.includes('/404')) return false;

        // Exclude old blog/guide pages that redirect via netlify.toml (301)
        const redirectedSlugs = [
          '/blog/how-to-change-swiss-health-insurance-2026',
          '/blog/switzerland-relocation-step-by-step-roadmap',
          '/blog/comprehensive-expat-services-switzerland-insurance-relocation-guide',
          '/blog/navigating-swiss-insurance-choosing-expat-insurance-broker-2025',
          '/blog/relocation-switzerland-ultimate-guide-smooth-move',
          '/blog/swiss-health-insurance-changes-2026',
          '/blog/relocating-to-switzerland-checklist',
          '/guides/how-to/change-health-insurance',
          '/guides/how-to/switch-health-insurance-providers',
          '/guides/how-to/relocate-to-switzerland-step-by-step-checklist.timeline',
          '/guides/how-to/relocate-to-switzerland-step-by-step-checklist.original',
          '/careers',
        ];
        if (redirectedSlugs.some(slug => page.includes(slug))) return false;

        // Exclude prototype page
        if (page.includes('/prototype')) return false;

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
    }),
    mdx()
  ],
  site: 'https://expat-savvy.ch',
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  },
});
