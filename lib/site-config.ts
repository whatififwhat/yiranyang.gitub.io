// The owner-approved address for the GitHub Pages launch.
export const SITE_URL = 'https://yiranyang.com';

export const PUBLIC_PAGE_PATHS = [
  '/', '/research', '/publications', '/grants', '/gallery', '/contact',
] as const;

export type PublicPagePath = typeof PUBLIC_PAGE_PATHS[number];
