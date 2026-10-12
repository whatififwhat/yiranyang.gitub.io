'use client';

import { useEffect } from 'react';
import type { PublicPagePath } from '@/lib/site-config';
import { visitorEndpoint } from '@/lib/visitor-config';
import { visitorOptedOut } from '@/lib/visitor-preferences';

const legacyPages: Record<string, string> = {
  '#research': '/research/',
  '#publications': '/publications/',
  '#publication': '/publications/',
  '#news': '/',
};

export function SiteInteractions({path}: {path: PublicPagePath}) {
  useEffect(() => {
    const redirectLegacy = () => {
      const destination = path === '/' ? legacyPages[window.location.hash] : undefined;
      if (destination) window.location.replace(destination);
    };
    redirectLegacy();
    window.addEventListener('hashchange', redirectLegacy);
    return () => window.removeEventListener('hashchange', redirectLegacy);
  }, [path]);
  useEffect(() => {
    const endpoint = visitorEndpoint();
    if (!endpoint || !['https://yiranyang.com', 'https://www.yiranyang.com'].includes(window.location.origin)) return;
    // Deferring also lets React's development effect cleanup cancel duplicate sends.
    const timer = window.setTimeout(() => {
      try {
        if ((path === '/' && legacyPages[window.location.hash]) ||
            visitorOptedOut(navigator, window.localStorage)) return;
        void fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: crypto.randomUUID(), path }),
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          keepalive: true,
        }).catch(() => { /* Analytics must never interrupt the website. */ });
      } catch { /* Unsupported or blocked browser APIs: skip collection. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [path]);
  return null;
}
