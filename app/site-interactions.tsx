'use client';

import { useEffect } from 'react';
import type { PublicPagePath } from '@/lib/site-config';

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
  return null;
}
