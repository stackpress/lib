import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const docsDir = join(root, 'docs');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4173);

const types = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp']
]);

function resolveTarget(url = '/') {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const clean = normalize(pathname).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]/, '');
  const candidate = resolve(docsDir, clean);
  if (!candidate.startsWith(`${docsDir}${sep}`) && candidate !== docsDir) return null;
  if (pathname.endsWith('/')) return join(candidate, 'index.html');
  if (!extname(candidate)) return `${candidate}.html`;
  return candidate;
}

const server = createServer(async (request, response) => {
  const target = resolveTarget(request.url);
  if (!target) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    const info = await stat(target);
    const file = info.isDirectory() ? join(target, 'index.html') : target;
    const contentType = types.get(extname(file)) || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, host, () => {
  console.log(`Serving docs at http://${host}:${port}/`);
});
