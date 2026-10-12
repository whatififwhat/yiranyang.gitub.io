// Public configuration only. Never put Cloudflare credentials in this file.
// Enable only after reviewing docs/visitor-records.md and deploying the Worker.
export const visitorConfig: { enabled: boolean; endpoint: string } = {
  enabled: true,
  endpoint: 'https://yiran-visitor-records.yiranyang-visitor.workers.dev/collect',
};

export function visitorEndpoint(config = visitorConfig): string | null {
  if (!config.enabled) return null;
  let url: URL;
  try { url = new URL(config.endpoint); }
  catch { throw new Error('Visitor records require a valid HTTPS Worker endpoint.'); }
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.workers.dev') ||
      url.pathname !== '/collect' || url.search || url.hash || url.username || url.password || url.port) {
    throw new Error('Visitor endpoint must be https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/collect');
  }
  return url.href;
}
