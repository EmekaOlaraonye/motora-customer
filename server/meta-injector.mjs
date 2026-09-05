import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Serves the built app, rewriting the HTML head per URL.
 *
 * WhatsApp, Facebook and LinkedIn do not execute JavaScript. They read the
 * HTML the server returns, so a client-rendered SPA shows the same generic
 * preview for every listing unless something injects the right tags first.
 * That is all this does.
 *
 * Usage:
 *   npm run build && npm run build:meta && npm run serve
 *
 * In production this logic belongs in an edge middleware (Vercel, Netlify,
 * Cloudflare) sitting in front of the static build. `resolveMeta` and
 * `metaTags` are the portable parts; this file is just a host for them.
 */

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const PORT = Number(process.env.PORT ?? 4173);
const SITE_URL = process.env.SITE_URL ?? `http://localhost:${PORT}`;

const { resolveMeta, metaTags } = await import(
  new URL('../dist-meta/meta-entry.js', import.meta.url).href
);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Replaces the document's title and head tags.
 *
 * Tags the shell already carries are stripped first, so the response has
 * exactly one of each rather than a duplicate the crawler has to choose from.
 */
function injectMeta(html, meta) {
  let head = html;

  head = head.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  head = head.replace(/\s*<meta\s+name="description"[^>]*>/gi, '');
  head = head.replace(/\s*<meta\s+(?:property|name)="(?:og|twitter|product):[^"]*"[^>]*>/gi, '');
  head = head.replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '');

  const tags = metaTags(meta)
    .map((tag) => {
      const attr = tag.property ? `property="${tag.property}"` : `name="${tag.name}"`;
      return `    <meta ${attr} content="${escapeHtml(tag.content)}" />`;
    })
    .join('\n');

  const canonical = `    <link rel="canonical" href="${escapeHtml(meta.canonical)}" />`;

  const jsonLd = meta.structuredData
    ? `\n    <script type="application/ld+json">${JSON.stringify(meta.structuredData).replace(
        /</g,
        '\u003c',
      )}</script>`
    : '';

  return head.replace('</head>', `${tags}\n${canonical}${jsonLd}\n  </head>`);
}

async function serveStatic(pathname) {
  // Resolve inside dist and verify containment, so a crafted path such as
  // /../../etc/passwd cannot escape the served directory.
  const filePath = resolve(DIST, '.' + normalize(pathname));
  if (filePath !== DIST && !filePath.startsWith(DIST + sep)) return undefined;

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return undefined;
    return { body: await readFile(filePath), type: MIME[extname(filePath)] ?? 'application/octet-stream' };
  } catch {
    return undefined;
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', SITE_URL);

  const asset = url.pathname === '/' ? undefined : await serveStatic(url.pathname);
  if (asset) {
    response.writeHead(200, { 'Content-Type': asset.type, 'Cache-Control': 'public, max-age=31536000, immutable' });
    response.end(asset.body);
    return;
  }

  // Everything else is an app route: serve the shell with the right head.
  const shell = await readFile(join(DIST, 'index.html'), 'utf8');
  const meta = await resolveMeta(url.pathname + url.search, SITE_URL);

  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=0, must-revalidate',
  });
  response.end(injectMeta(shell, meta));
});

server.listen(PORT, () => {
  console.log(`Motora preview server on ${SITE_URL}`);
  console.log('Link previews are injected per route. Try /vehicles/<slug>.');
});
