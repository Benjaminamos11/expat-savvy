import fs from 'fs';
import { parse } from 'node-html-parser';

// Read the sitemap file
const sitemapContent = fs.readFileSync('./public/sitemap.xml', 'utf8');

// Parse the XML
const root = parse(sitemapContent);
const urls = root.querySelectorAll('url loc');

console.log(`Total URLs in sitemap: ${urls.length}`);

// Check for URLs without trailing slashes
const urlsWithoutTrailingSlash = urls
  .map(url => url.textContent)
  .filter(url => {
    // Skip the homepage
    if (url === 'https://expat-savvy.ch/') return false;
    
    // Check if URL has a file extension (.html, .xml, etc.)
    if (/\.[a-zA-Z0-9]{2,4}$/.test(url)) return false;
    
    // Check if URL ends with a trailing slash
    return !url.endsWith('/');
  });

if (urlsWithoutTrailingSlash.length > 0) {
  console.log('\nFound URLs without trailing slashes:');
  urlsWithoutTrailingSlash.forEach(url => console.log(`- ${url}`));
} else {
  console.log('\nAll URLs have proper trailing slashes! ✅');
}

// Check for URLs that have ".html" in them
const urlsWithHtml = urls
  .map(url => url.textContent)
  .filter(url => url.includes('.html'));

if (urlsWithHtml.length > 0) {
  console.log('\nFound URLs with .html:');
  urlsWithHtml.forEach(url => console.log(`- ${url}`));
} else {
  console.log('\nNo URLs contain .html ✅');
} 