import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
export function createServer() {
  const send = (res, status, data) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (!['GET', 'HEAD'].includes(req.method)) return send(res, 405, { error: 'Method not allowed.' });
      const requested = decodeURIComponent(url.pathname);
      const pages = { '/': '/index.html', '/index.html': '/index.html', '/leadership': '/leadership.html', '/leadership/': '/leadership.html', '/leadership.html': '/leadership.html' };
      if (!Object.hasOwn(pages, requested) && !/^\/assets\/[a-zA-Z0-9_./ -]+$/.test(requested)) return send(res, 404, { error: 'Not found.' });
      const file = path.resolve(root, '.' + (pages[requested] || requested));
      if (!file.startsWith(root + path.sep)) return send(res, 404, { error: 'Not found.' });
      const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jfif': 'image/jpeg', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
      if (!types[path.extname(file)]) return send(res, 404, { error: 'Not found.' });
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[path.extname(file)], 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (error) { send(res, error.code === 'ENOENT' ? 404 : 502, { error: 'Service unavailable. Please try again.' }); }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createServer().listen(Number(process.env.PORT) || 3000, () => console.log('Portfolio server ready. Open http://localhost:' + (process.env.PORT || 3000)));
}
