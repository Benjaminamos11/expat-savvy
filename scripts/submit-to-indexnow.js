#!/usr/bin/env node

/**
 * IndexNow URL Submission CLI
 * 
 * This script can be used to submit URLs to IndexNow when content is updated.
 * 
 * Usage:
 * node submit-to-indexnow.js https://expat-savvy.ch/page1 https://expat-savvy.ch/page2
 */

// Import node-fetch if in Node.js environment
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Your IndexNow API key - keep this the same as your key file
const INDEXNOW_KEY = '425777cceabba1795f709019a3876a41';
const HOST = 'expat-savvy.ch';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

/**
 * Submit one or more URLs to IndexNow
 * @param {string[]} urls - Array of URLs to submit
 * @returns {Promise<Object>} - The response from the IndexNow API
 */
async function submitToIndexNow(urls) {
  // Validate that all URLs belong to the same host
  urls.forEach(url => {
    if (!url.includes(HOST)) {
      throw new Error(`URL ${url} does not belong to host ${HOST}`);
    }
  });
  
  // Prepare the request body
  const requestBody = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  };
  
  try {
    console.log(`Submitting ${urls.length} URLs to IndexNow...`);
    
    // Submit to IndexNow API
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(requestBody)
    });
    
    // Handle response
    if (response.ok) {
      console.log(`✅ Successfully submitted ${urls.length} URLs to IndexNow`);
      return { success: true, message: `Successfully submitted ${urls.length} URLs` };
    } else {
      console.error(`❌ Error submitting URLs to IndexNow: ${response.status} ${response.statusText}`);
      return { 
        success: false, 
        statusCode: response.status, 
        message: response.statusText
      };
    }
  } catch (error) {
    console.error('❌ Failed to submit URLs to IndexNow:', error);
    return { success: false, message: error.message };
  }
}

// Main function to run script
async function main() {
  // Get URLs from command line arguments
  const urls = process.argv.slice(2);
  
  if (urls.length === 0) {
    console.error('❌ Error: No URLs provided');
    console.log('Usage: node submit-to-indexnow.js URL1 URL2 URL3 ...');
    process.exit(1);
  }
  
  try {
    await submitToIndexNow(urls);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main(); 