import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globby } from 'globby';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteUrl = 'https://expat-savvy.ch';

// Function to get the current date in YYYY-MM-DD format
const formatDate = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

async function generateSitemap() {
  // Get all files except for 404, draft pages, and specific excluded patterns
  const pages = await globby([
    // Include these file patterns
    '../pages/**/*.astro',
    '../pages/**/*.md',
    '../pages/**/*.mdx',
    '../content/blog/**/*.md',
    '../content/blog/**/*.mdx',
    
    // Exclude these patterns
    '!../pages/404.astro',
    '!../components/**/*',
    '!../layouts/**/*',
    '!**/node_modules/**',
    '!**/_*.{js,jsx,ts,tsx,astro,md,mdx}' // Exclude files starting with underscore
  ], {
    cwd: __dirname
  });

  // Create sitemap entries for each page
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Pages -->
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${formatDate()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${pages
  .map(page => {
    // Convert file path to URL format
    let path = page
      .replace('../pages/', '')
      .replace('../content/blog/', 'blog/')
      .replace(/\.(astro|md|mdx)$/, '')
      .replace(/\/index$/, '');
    
    // Special handling for blog post URLs
    if (path.startsWith('blog/')) {
      // For blog posts, remove any "src/" prefix that might have been captured
      path = path.replace('src/', '');
    }
    
    // Skip any paths containing 'draft' or starting with an underscore
    if (path.includes('draft') || path.startsWith('_')) {
      return '';
    }

    // Determine changefreq and priority based on path
    let changefreq = 'monthly';
    let priority = '0.7';
    
    if (path.includes('blog/')) {
      changefreq = 'monthly';
      priority = '0.8';
    } else if (path.includes('compare-providers/')) {
      changefreq = 'monthly';
      priority = '0.9';
    } else if (path.includes('healthcare/all-insurances/')) {
      changefreq = 'weekly';
      priority = '0.9';
    }

    return `  <url>
    <loc>${siteUrl}/${path}</loc>
    <lastmod>${formatDate()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .filter(entry => entry) // Remove empty entries
  .join('\n')}
</urlset>`;

  // Write sitemap to public directory
  fs.writeFileSync(path.join(__dirname, '../../public/sitemap-full.xml'), sitemap);
  console.log('Sitemap generated successfully!');
}

generateSitemap().catch(e => {
  console.error(e);
  process.exit(1);
}); 