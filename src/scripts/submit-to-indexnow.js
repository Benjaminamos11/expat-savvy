const API_KEY = 'e8c7f852a41b4f2d9c5e6b3a7d8f9g0h';
const SITE_URL = 'https://expat-savvy.ch';

// List of URLs to submit
const urls = [
  '/',
  '/about',
  '/health-insurance',
  '/3rd-pillar',
  '/pension-planning',
  '/life-insurance',
  '/compare-providers',
  '/healthcare/all-insurances/assura',
  '/healthcare/all-insurances/css',
  '/healthcare/all-insurances/groupe-mutuel',
  '/healthcare/all-insurances/helsana',
  '/healthcare/all-insurances/kpt',
  '/healthcare/all-insurances/sanitas',
  '/healthcare/all-insurances/swica',
  '/healthcare/all-insurances/visana',
  '/insurance-guides/cross-border-insurance',
  '/insurance-guides/family-insurance-planning',
  '/insurance-guides/student-insurance',
  '/insurance-guides/self-employed-insurance',
  '/news/regional-guides/zurich',
  '/news/regional-guides/geneva',
  '/news/regional-guides/basel',
  '/news/regional-guides/lausanne',
  '/news/regional-guides/bern',
  '/news/regional-guides/zug',
  '/news/regional-guides/lugano'
];

// Format URLs with site domain
const fullUrls = urls.map(url => `${SITE_URL}${url}`);

// Submit URLs to IndexNow
async function submitToIndexNow() {
  try {
    const response = await fetch('https://www.bing.com/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        host: SITE_URL,
        key: API_KEY,
        keyLocation: `${SITE_URL}/${API_KEY}.txt`,
        urlList: fullUrls
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    throw new Error(`Failed to submit to IndexNow: ${error.message}`);
  }
}

// Submit single URL to IndexNow
async function submitSingleUrl(url) {
  try {
    const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;
    const response = await fetch(`https://www.bing.com/indexnow?url=${encodeURIComponent(fullUrl)}&key=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    throw new Error(`Failed to submit URL ${url}: ${error.message}`);
  }
}

export { submitToIndexNow, submitSingleUrl };