// Safe to run from GitHub Actions: every POST opts out of recording.
// No IP address, credential, database content, or response body is printed.
import assert from 'node:assert/strict';
import { visitorConfig, visitorEndpoint } from '../lib/visitor-config.ts';

if (!visitorConfig.endpoint) {
  console.log('Visitor service not configured; external check skipped.');
  process.exit(0);
}
const endpoint = visitorEndpoint({ ...visitorConfig, enabled: true });
const origin = new URL(endpoint).origin;
const headers = { Origin: 'https://yiranyang.com' };
const checks = [
  { name: 'No public dashboard', url: `${origin}/admin`, options: {}, statuses: [404] },
  { name: 'No public record reads', url: endpoint, options: { headers }, statuses: [405] },
  { name: 'Website preflight', url: endpoint, options: { method: 'OPTIONS', headers: { ...headers, 'Access-Control-Request-Method': 'POST' } }, statuses: [204], cors: true },
  { name: 'Opt-out POST (never recorded)', url: endpoint, options: {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json', DNT: '1', 'Sec-GPC': '1' },
    body: JSON.stringify({ eventId: crypto.randomUUID(), path: '/' }),
  // The frontend is deliberately deployed before the backend is enabled.
  }, statuses: [204, 503], cors: true },
];
try {
  for (const check of checks) {
    const response = await fetch(check.url, { ...check.options, redirect: 'error', signal: AbortSignal.timeout(15000) });
    assert(check.statuses.includes(response.status), `${check.name}: unexpected HTTP ${response.status}`);
    assert.equal(await response.text(), '', `${check.name}: unexpected response body`);
    assert.equal(response.headers.get('cache-control'), 'no-store', `${check.name}: do not cache`);
    if (check.cors) assert.equal(response.headers.get('access-control-allow-origin'), headers.Origin);
    assert.equal(response.headers.get('access-control-allow-credentials'), null);
    console.log(`${check.name}: HTTP ${response.status}, passed`);
  }
} catch (error) {
  console.error('Visitor service verification failed:', error.message, error.cause?.code ?? '');
  process.exitCode = 1;
}
