import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globby } from 'globby';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteUrl = 'https://expat-savvy.ch';

// Function to get the current date in YYYY-MM-DD format
const formatDate = () => {
  // Use a fixed date for all entries to maintain consistency
  return '2025-05-13';
};

// Function to ensure URL has proper trailing slash
function ensureTrailingSlash(url) {
  // If it's the homepage, don't add a trailing slash
  if (url === '' || url === '/') return '';
  
  // If URL has a file extension, don't add a trailing slash
  if (/\.[a-zA-Z0-9]{2,4}$/.test(url)) return url;
  
  // Add trailing slash if not present
  return url.endsWith('/') ? url : url + '/';
}

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
    '!**/_*.{js,jsx,ts,tsx,astro,md,mdx}', // Exclude files starting with underscore
    '!**/draft*.{js,jsx,ts,tsx,astro,md,mdx}' // Exclude draft files
  ], {
    cwd: __dirname
  });

  // Manually ensure blog posts are included by listing the directory
  let blogPosts = [];
  try {
    const blogDir = path.join(__dirname, '../content/blog');
    const entries = fs.readdirSync(blogDir);
    
    blogPosts = entries
      .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
      .filter(file => !file.startsWith('_') && !file.includes('draft'))
      .map(file => `blog/${file.replace(/\.(md|mdx)$/, '')}`);
  } catch (err) {
    console.error('Error reading blog directory:', err);
  }

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
    
    // Skip any paths containing 'draft', starting with an underscore, or containing dynamic route patterns
    if (path.includes('draft') || path.startsWith('_') || path.includes('[...') || path.includes('[')) {
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

    // Ensure path has correct trailing slash
    path = ensureTrailingSlash(path);

    return `  <url>
    <loc>${siteUrl}/${path}</loc>
    <lastmod>${formatDate()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .filter(entry => entry) // Remove empty entries
  .join('\n')}

${blogPosts
  .map(postPath => {
    // Skip any paths containing 'draft' or starting with an underscore
    if (postPath.includes('draft') || postPath.startsWith('_')) {
      return '';
    }

    // Ensure path has proper trailing slash
    postPath = ensureTrailingSlash(postPath);

    return `  <url>
    <loc>${siteUrl}/${postPath}</loc>
    <lastmod>${formatDate()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
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