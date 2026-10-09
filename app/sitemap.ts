import type { MetadataRoute } from 'next';
import { PUBLIC_PAGE_PATHS, SITE_URL } from '@/lib/site-config';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGE_PATHS.map(path => ({ url: new URL(path === '/' ? '/' : `${path}/`, SITE_URL).href }));
}
