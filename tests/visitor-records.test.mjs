import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker, { clientIp } from '../analytics-worker/worker.mjs';
import { visitorEndpoint } from '../lib/visitor-config.ts';
import { visitorOptedOut } from '../lib/visitor-preferences.ts';

const event = { eventId: '4f532eef-a9fa-46b4-a178-efb980308782', path: '/research' };
function request({ method = 'POST', route = '/collect', body = event, headers = {}, edge = true } = {}) {
  const req = new Request(`https://test.example.workers.dev${route}`, {
    method,
    headers: { origin: 'https://yiranyang.com', 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.7', ...headers },
    ...(method !== 'GET' && method !== 'OPTIONS' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });
  if (edge) Object.defineProperty(req, 'cf', { value: {} });
  return req;
}
function environment(t) {
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  db.exec(readFileSync(new URL('../analytics-worker/schema.sql', import.meta.url), 'utf8'));
  return {
    db,
    COLLECTION_ENABLED: 'true',
    VISIT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    DB: { prepare: sql => ({ bind: (...args) => ({ run: async () => db.prepare(sql).run(...args) }) }) },
  };
}
const rows = env => env.db.prepare('SELECT * FROM visits').all();

test('records only the requested fields using server IP/time and deduplicates event IDs', async t => {
  const env = environment(t);
  const start = Date.now();
  assert.equal((await worker.fetch(request(), env)).status, 204);
  assert.equal((await worker.fetch(request(), env)).status, 204);
  const saved = rows(env);
  assert.equal(saved.length, 1);
  assert.deepEqual(Object.keys(saved[0]), ['event_id', 'visited_at', 'path', 'ip']);
  assert.equal(saved[0].ip, '203.0.113.7');
  assert.equal(saved[0].path, '/research');
  assert(saved[0].visited_at >= start && saved[0].visited_at <= Date.now());
});

test('there is no public route to read records', async t => {
  const env = environment(t);
  await worker.fetch(request(), env);
  for (const route of ['/collect', '/admin', '/visits', '/export', '/']) {
    const res = await worker.fetch(request({ method: 'GET', route }), env);
    assert([404, 405].includes(res.status));
    assert.equal(await res.text(), '');
    assert.equal(res.headers.get('cache-control'), 'no-store');
  }
});

test('CORS allows only the exact website origin and POST preflight', async t => {
  const env = environment(t);
  for (const origin of ['null', '', 'http://yiranyang.com', 'https://yiranyang.com.evil.test']) {
    const res = await worker.fetch(request({ headers: { origin } }), env);
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('access-control-allow-origin'), null);
  }
  const preflight = await worker.fetch(request({ method: 'OPTIONS', headers: { 'access-control-request-method': 'POST' } }), env);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'https://yiranyang.com');
  assert.equal(preflight.headers.get('access-control-allow-credentials'), null);
  assert.equal(rows(env).length, 0);
});

test('collection fails closed when disabled, unconfigured, rate limited or database fails', async t => {
  const env = environment(t);
  for (const [patch, status] of [
    [{ COLLECTION_ENABLED: 'false' }, 503],
    [{ COLLECTION_ENABLED: undefined }, 503],
    [{ DB: undefined }, 503],
    [{ VISIT_RATE_LIMITER: undefined }, 503],
    [{ VISIT_RATE_LIMITER: { limit: async () => ({ success: false }) } }, 429],
    [{ DB: { prepare: () => { throw new Error('SECRET DATABASE ERROR'); } } }, 503],
  ]) {
    const res = await worker.fetch(request(), { ...env, ...patch });
    assert.equal(res.status, status);
    assert.equal(await res.text(), '');
  }
  assert.equal(rows(env).length, 0);
});

test('DNT and GPC prevent database writes', async t => {
  const env = environment(t);
  for (const headers of [{ dnt: '1' }, { 'sec-gpc': '1' }]) {
    assert.equal((await worker.fetch(request({ headers }), env)).status, 204);
  }
  assert.equal(rows(env).length, 0);
});

test('rejects URL queries, arbitrary paths, forged IP fields and oversized bodies', async t => {
  const env = environment(t);
  for (const body of [null, [], {}, { ...event, ip: '1.2.3.4' }, { ...event, path: '/research?secret=1' },
    { ...event, path: '/admin' }, { ...event, eventId: "'; DROP TABLE visits;--" }, '{invalid']) {
    assert.equal((await worker.fetch(request({ body }), env)).status, 400);
  }
  assert.equal((await worker.fetch(request({ body: 'x'.repeat(513) }), env)).status, 413);
  assert.equal((await worker.fetch(request({ route: '/collect?ip=1.2.3.4' }), env)).status, 404);
  assert.equal((await worker.fetch(request({ headers: { 'content-type': 'text/plain' } }), env)).status, 415);
  assert.equal(rows(env).length, 0);
});

test('IP handling requires Cloudflare ingress; ignores spoofable forwarding headers', async t => {
  const env = environment(t);
  assert.equal(clientIp(request({ edge: false })), null);
  for (const ip of ['', '999.1.1.1', '01.2.3.4', '127.0.0.1, 1.2.3.4', 'garbage', '2a06:98c0:3600::103']) {
    const req = request({ headers: { 'cf-connecting-ip': ip, 'x-forwarded-for': '1.2.3.4' } });
    assert.equal(clientIp(req), null);
    assert.equal((await worker.fetch(req, env)).status, 400);
  }
  assert.equal(clientIp(request({ headers: { 'cf-connecting-ip': '2001:0db8::1' } })), '2001:db8::1');
  assert.equal(clientIp(request({ headers: { 'cf-worker': 'another.example' } })), null);
});

test('hourly cleanup deletes expired records even while collection is off', async t => {
  const env = environment(t);
  const now = Date.now();
  env.db.prepare('INSERT INTO visits VALUES (?, ?, ?, ?)').run('old', now - 31 * 86400000, '/', '203.0.113.7');
  env.db.prepare('INSERT INTO visits VALUES (?, ?, ?, ?)').run('recent', now, '/', '203.0.113.8');
  assert.equal(env.db.prepare('SELECT * FROM recent_visits').all().length, 1);
  await worker.scheduled({}, { ...env, COLLECTION_ENABLED: 'false' });
  assert.deepEqual(rows(env).map(row => row.event_id), ['recent']);
});

test('browser opt-out respects GPC, DNT, saved preference, and blocked storage', () => {
  const clear = { getItem: () => null };
  assert.equal(visitorOptedOut({}, clear), false);
  assert.equal(visitorOptedOut({ globalPrivacyControl: true }, clear), true);
  assert.equal(visitorOptedOut({ doNotTrack: '1' }, clear), true);
  assert.equal(visitorOptedOut({}, { getItem: () => '1' }), true);
  assert.equal(visitorOptedOut({}, { getItem: () => { throw new Error('blocked'); } }), true);
});

test('disabled frontend configuration never sends records; enabled configuration rejects unsafe endpoints', () => {
  assert.equal(visitorEndpoint({ enabled: false, endpoint: '' }), null);
  for (const endpoint of ['', 'http://a.b.workers.dev/collect', 'https://evil.test/collect', 'https://a.b.workers.dev/admin', 'https://a.b.workers.dev/collect?token=secret']) {
    assert.throws(() => visitorEndpoint({ enabled: true, endpoint }));
  }
  assert.equal(visitorEndpoint({ enabled: true, endpoint: 'https://a.b.workers.dev/collect' }), 'https://a.b.workers.dev/collect');
});
