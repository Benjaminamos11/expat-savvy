import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  let filePath = path.join(__dirname, req.url === '/' ? '/src/pages/index.astro' : req.url);
  
  // Simple response for now
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <!DOCTYPE html>
    <html>
    <head><title>Test Server</title></head>
    <body>
      <h1>Server is Working!</h1>
      <p>Time: ${new Date().toISOString()}</p>
      <p>URL requested: ${req.url}</p>
      <button onclick="alert('JavaScript is working!')">Test Button</button>
    </body>
    </html>
  `);
});

const PORT = 9000;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Simple server running at http://127.0.0.1:${PORT}/`);
  console.log(`Also try: http://localhost:${PORT}/`);
});