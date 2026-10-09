import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('out');
const pages = ['/', '/research/', '/publications/', '/grants/', '/gallery/', '/contact/'];
const origin = 'https://yiranyang.com';
const exists = async file => stat(file).then(() => true, () => false);

for (const route of [...pages, '/privacy/']) {
  const html = await readFile(path.join(root, route, 'index.html'), 'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${route}: one main heading`);
  assert(!html.includes('href="/admin"'), `${route}: no unavailable owner dashboard`);
  if (pages.includes(route)) {
    const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/);
    assert(canonical, `${route}: canonical URL exists`);
    assert.equal(new URL(canonical[1]).origin, origin);
    assert.equal(new URL(canonical[1]).pathname.replace(/\/$/, ''), route.replace(/\/$/, ''));
  }
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)[^\"]*"/g)) {
    const url = new URL(match[1], origin);
    const local = path.join(root, decodeURIComponent(url.pathname));
    assert(await exists(local) || await exists(path.join(local, 'index.html')), `${route}: missing ${url.pathname}`);
  }
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    assert(/\balt="[^"]+"/.test(image[0]), `${route}: image needs alternative text`);
  }
}

const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length);
for (const route of pages) assert(sitemap.includes(`${origin}${route}</loc>`));
assert((await readFile(path.join(root, 'robots.txt'), 'utf8')).includes(`${origin}/sitemap.xml`));
assert.equal((await readFile(path.join(root, 'CNAME'), 'utf8')).trim(), 'yiranyang.com');
for (const file of ['.nojekyll', '404.html', 'news/index.html', 'interests/index.html', 'CV_Yiran_Yang.pdf']) {
  assert(await exists(path.join(root, file)), `Missing ${file}`);
}
assert((await readFile(path.join(root, 'news/index.html'), 'utf8')).includes('content="0;url=/"'));
assert((await readFile(path.join(root, 'interests/index.html'), 'utf8')).includes('content="0;url=/#interests"'));

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    assert(!entry.isSymbolicLink(), `Do not publish symlinks: ${file}`);
    assert(!['.git', '.openai', 'work', 'db', 'admin', 'api'].includes(entry.name), `Private or server files: ${file}`);
    assert(!entry.name.startsWith('.env'), `Environment file: ${file}`);
    if (entry.isDirectory()) await inspect(file);
    else if (/\.(html|js|css|json|xml|txt)$/.test(entry.name)) {
      const content = await readFile(file, 'utf8');
      assert(!content.includes('/api/visit'), `Analytics request remains: ${file}`);
      assert(!content.includes('dear-robin-0124'), `Old hosting origin remains: ${file}`);
      assert(!content.includes('@gmail.com'), `Unapproved contact address: ${file}`);
      assert(!content.includes('ANALYTICS_OWNER_'), `Server authorization code: ${file}`);
    }
  }
}
await inspect(root);
console.log('Static export verified: pages, local links, images, canonical URLs, sitemap, redirects, and publication boundary.');
