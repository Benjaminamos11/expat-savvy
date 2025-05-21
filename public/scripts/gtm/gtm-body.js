// GTM body script (noscript iframe)
// This script is normally rendered as an iframe, but we're using JavaScript to create it
document.addEventListener('DOMContentLoaded', function() {
  // Create the iframe element for browsers with JavaScript disabled
  var iframe = document.createElement('iframe');
  iframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM-NC6FSJTW';
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  // Add the iframe to the beginning of the body
  document.body.insertBefore(iframe, document.body.firstChild);
});
