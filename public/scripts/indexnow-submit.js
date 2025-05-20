/**
 * IndexNow URL Submission Script
 * 
 * This script can be used to submit URLs to IndexNow when content is updated.
 * 
 * Usage examples:
 * - Single URL: submitToIndexNow('https://expat-savvy.ch/new-page')
 * - Multiple URLs: submitToIndexNow(['https://expat-savvy.ch/page1', 'https://expat-savvy.ch/page2'])
 */

// Your IndexNow API key - keep this the same as your key file
const INDEXNOW_KEY = '425777cceabba1795f709019a3876a41';
const HOST = 'expat-savvy.ch';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

/**
 * Submit one or more URLs to IndexNow
 * @param {string|string[]} urls - A single URL or array of URLs to submit
 * @returns {Promise<Object>} - The response from the IndexNow API
 */
async function submitToIndexNow(urls) {
  // Convert single URL to array if needed
  const urlList = Array.isArray(urls) ? urls : [urls];
  
  // Validate that all URLs belong to the same host
  urlList.forEach(url => {
    if (!url.includes(HOST)) {
      throw new Error(`URL ${url} does not belong to host ${HOST}`);
    }
  });
  
  // Prepare the request body
  const requestBody = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urlList
  };
  
  try {
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
      console.log(`Successfully submitted ${urlList.length} URLs to IndexNow`);
      return { success: true, message: `Successfully submitted ${urlList.length} URLs` };
    } else {
      console.error(`Error submitting URLs to IndexNow: ${response.status} ${response.statusText}`);
      return { 
        success: false, 
        statusCode: response.status, 
        message: response.statusText
      };
    }
  } catch (error) {
    console.error('Failed to submit URLs to IndexNow:', error);
    return { success: false, message: error.message };
  }
}

// For Node.js environments
if (typeof module !== 'undefined') {
  module.exports = { submitToIndexNow };
} 