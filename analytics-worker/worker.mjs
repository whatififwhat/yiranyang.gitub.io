// Standalone Cloudflare Worker. Never deploy this as GitHub Pages content.
const ORIGINS = new Set(['https://yiranyang.com', 'https://www.yiranyang.com']);
const PATHS = new Set(['/', '/research', '/publications', '/grants', '/gallery', '/contact']);
const RETENTION_MS = 30 * 86400 * 1000;
const MAX_BYTES = 512;

export function clientIp(request) {
  // Only valid behind Cloudflare ingress. Never trust X-Forwarded-For/body values.
  if (!request.cf || request.headers.has('cf-worker')) return null;
  const ip = request.headers.get('cf-connecting-ip')?.trim();
  if (!ip || ip.length > 45) return null;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return ip.split('.').every(part => Number(part) <= 255 && String(Number(part)) === part) ? ip : null;
  }
  if (!/^[a-f\d:.]+$/i.test(ip) || !ip.includes(':')) return null;
  try {
    const normalized = new URL(`https://[${ip}]/`).hostname.slice(1, -1);
    return normalized === '2a06:98c0:3600::103' ? null : normalized;
  } catch { return null; }
}

async function readPayload(request) {
  if (!request.body) throw new Error('invalid-body');
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); throw new Error('body-too-large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).some(key => !['eventId', 'path'].includes(key)) ||
      !PATHS.has(value.path) || typeof value.eventId !== 'string' ||
      !/^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(value.eventId)) {
    throw new Error('invalid-body');
  }
  return { eventId: value.eventId.toLowerCase(), path: value.path };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin');
    const headers = {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Vary': 'Origin',
    };
    if (ORIGINS.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
    const respond = status => new Response(null, { status, headers });
    const url = new URL(request.url);
    // No read, export, admin, health or debug endpoint exposes visitor data.
    if (url.pathname !== '/collect' || url.search) return respond(404);
    if (!ORIGINS.has(origin)) return respond(403);
    if (request.method === 'OPTIONS') {
      if (request.headers.get('access-control-request-method') !== 'POST') return respond(405);
      headers['Access-Control-Allow-Methods'] = 'POST';
      headers['Access-Control-Allow-Headers'] = 'Content-Type, DNT, Sec-GPC';
      return respond(204);
    }
    if (request.method !== 'POST') return respond(405);
    if (env.COLLECTION_ENABLED !== 'true') return respond(503);
    if (request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1') return respond(204);
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return respond(415);
    const length = request.headers.get('content-length');
    if (length !== null && (!/^\d+$/.test(length) || Number(length) > MAX_BYTES)) return respond(413);
    const ip = clientIp(request);
    if (!ip) return respond(400);
    if (!env.DB || !env.VISIT_RATE_LIMITER) return respond(503);
    try {
      // An ephemeral rate-limit key, not a persistent visitor identifier.
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
      const key = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
      if (!(await env.VISIT_RATE_LIMITER.limit({ key })).success) return respond(429);
      let payload;
      try { payload = await readPayload(request); }
      catch (error) { return respond(error.message === 'body-too-large' ? 413 : 400); }
      await env.DB.prepare('INSERT OR IGNORE INTO visits (event_id, visited_at, path, ip) VALUES (?, ?, ?, ?)')
        .bind(payload.eventId, Date.now(), payload.path, ip).run();
      return respond(204);
    } catch {
      // No exception details, headers, or visitor data in responses or logs.
      return respond(503);
    }
  },
  async scheduled(_controller, env) {
    // Cleanup continues even when collection is disabled.
    await env.DB.prepare('DELETE FROM visits WHERE visited_at < ?')
      .bind(Date.now() - RETENTION_MS).run();
  },
};
