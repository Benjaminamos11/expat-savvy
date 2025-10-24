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

// Function to check if a URL has a redirect configured
function hasRedirect(url) {
  // List of URLs that redirect (from netlify.toml)
  const redirectUrls = [
    // Regional guides redirects
    'news/regional-guides/zurich-insurance',
    'news/regional-guides/zurich-insurance/',
    'news/regional-guides/zurich/',
    'news/regional-guides/zurich',
    'news/regional-guides/geneva-insurance',
    'news/regional-guides/geneva-insurance/',
    'news/regional-guides/geneva/',
    'news/regional-guides/geneva',
    'news/regional-guides/basel-insurance',
    'news/regional-guides/basel-insurance/',
    'news/regional-guides/basel/',
    'news/regional-guides/basel',
    'news/regional-guides/bern-insurance',
    'news/regional-guides/bern-insurance/',
    'news/regional-guides/bern/',
    'news/regional-guides/bern',
    'news/regional-guides/lausanne-insurance',
    'news/regional-guides/lausanne-insurance/',
    'news/regional-guides/lausanne/',
    'news/regional-guides/lausanne',
    'news/regional-guides/zug-insurance',
    'news/regional-guides/zug-insurance/',
    'news/regional-guides/zug/',
    'news/regional-guides/zug',
    'news/regional-guides/lugano-insurance',
    'news/regional-guides/lugano-insurance/',
    'news/regional-guides/lugano/',
    'news/regional-guides/lugano',
    
    // Archived pages redirects
    'healthcare/all-insurances/_archived/groupe-mutuel',
    'healthcare/all-insurances/_archived/groupe-mutuel/',
    'compare-providers/_archived/kpt-vs-helsana',
    'compare-providers/_archived/kpt-vs-helsana/',
    'compare-providers/_archived/groupe-mutuel-vs-assura',
    'compare-providers/_archived/groupe-mutuel-vs-assura/',
    'compare-providers/_archived/concordia-vs-kpt',
    'compare-providers/_archived/concordia-vs-kpt/',
    'healthcare/all-insurances/_archived/atupri',
    'healthcare/all-insurances/_archived/atupri/',
    'healthcare/all-insurances/_archived/swica',
    'healthcare/all-insurances/_archived/swica/',
    'healthcare/all-insurances/_archived/helsana',
    'healthcare/all-insurances/_archived/helsana/',
    'healthcare/all-insurances/_archived/concordia',
    'healthcare/all-insurances/_archived/concordia/',
    'blog/_archived/best-health-insurance-switzerland-expats',
    'blog/_archived/best-health-insurance-switzerland-expats/',
    'healthcare/all-insurances/_archived/css',
    'healthcare/all-insurances/_archived/css/',
    'healthcare/all-insurances/_archived/sympany',
    'healthcare/all-insurances/_archived/sympany/',
    'index',
    'index/',
    'blog/_archived/best-health-insurance-switzerland',
    'blog/_archived/best-health-insurance-switzerland/',
    'healthcare/all-insurances/_archived/sanitas',
    'healthcare/all-insurances/_archived/sanitas/',
    'healthcare/all-insurances/_archived/assura',
    'healthcare/all-insurances/_archived/assura/',
    'compare-providers/_archived/visana-vs-atupri',
    'compare-providers/_archived/visana-vs-atupri/',
    'compare-providers/_archived/groupe-mutuel-vs-sympany',
    'compare-providers/_archived/groupe-mutuel-vs-sympany/',
    'healthcare/all-insurances/_archived/visana',
    'healthcare/all-insurances/_archived/visana/',
    'healthcare/all-insurances/_archived/kpt',
    'healthcare/all-insurances/_archived/kpt/',
    
    // Other redirects
    'insurance',
    'insurance/',
    'guides/moving-cantons',
    'guides/moving-cantons/',
    'healthcare/glossary',
    'healthcare/glossary/',
    'draft',
    'draft/',
    'test-alpine-modal',
    'test-alpine-modal/',
    'simple-test.html',
    'simple-test.html/',
    'providers/swica',
    'providers/swica/',
    'providers/helsana',
    'providers/helsana/',
    'providers/css',
    'providers/css/',
    'providers/sanitas',
    'providers/sanitas/',
    'providers/assura',
    'providers/assura/',
    'providers/concordia',
    'providers/concordia/',
    'providers/atupri',
    'providers/atupri/',
    'providers/groupe-mutuel',
    'providers/groupe-mutuel/',
    'providers/kpt',
    'providers/kpt/',
    'providers/visana',
    'providers/visana/',
    'providers/sympany',
    'providers/sympany/',
    'healthcare/all-insurances/egk',
    'healthcare/all-insurances/egk/',
    'healthcare/all-insurances/axa',
    'healthcare/all-insurances/axa/'
  ];
  
  return redirectUrls.includes(url);
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

  // Manually add insurer pages that are generated dynamically
  const insurerPages = [
    'healthcare/all-insurances/helsana',
    'healthcare/all-insurances/swica', 
    'healthcare/all-insurances/css',
    'healthcare/all-insurances/sanitas',
    'healthcare/all-insurances/concordia',
    'healthcare/all-insurances/atupri',
    'healthcare/all-insurances/assura',
    'healthcare/all-insurances/groupe-mutuel',
    'healthcare/all-insurances/kpt',
    'healthcare/all-insurances/visana',
    'healthcare/all-insurances/sympany'
  ];

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
    // Note: We now include dynamic routes like [slug].astro as they generate actual pages
    if (path.includes('draft') || path.startsWith('_')) {
      return '';
    }

    // Skip URLs that have redirects configured
    if (hasRedirect(path)) {
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

${insurerPages
  .map(insurerPath => {
    // Ensure path has proper trailing slash
    insurerPath = ensureTrailingSlash(insurerPath);

    return `  <url>
    <loc>${siteUrl}/${insurerPath}</loc>
    <lastmod>${formatDate()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  })
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