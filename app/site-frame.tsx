import type { ReactNode } from 'react';
import type { PublicPagePath } from '@/lib/site-config';
import { SiteInteractions } from './site-interactions';

const pages: {path: PublicPagePath; label: string}[] = [
  {path: '/', label: 'Home'},
  {path: '/research', label: 'Research'},
  {path: '/publications', label: 'Publications'},
  {path: '/grants', label: 'Grants'},
  {path: '/gallery', label: 'Gallery'},
  {path: '/contact', label: 'Contact'},
];

export function SiteFrame({path, children}: {path: PublicPagePath; children: ReactNode}) {
  return <>
    <SiteInteractions path={path} />
    <a className="skip-link" href="#main">Skip to content</a>
    <div className={`academic-page${path === '/' ? ' academic-page--home' : ''}`}>
      <header className="site-header">
        <a className="site-name" href="/">Yiran Yang</a>
        <p className="affiliation">Planetary Science · University of Science and Technology of China</p>
        <nav aria-label="Main navigation">
          {pages.map(page => <a key={page.path} href={page.path === '/' ? '/' : `${page.path}/`} aria-current={path===page.path?'page':undefined}>{page.label}</a>)}
          <a href="/CV_Yiran_Yang.pdf" target="_blank" rel="noreferrer">CV</a>
        </nav>
      </header>
      <main id="main" className={`page-content${path === '/' ? ' page-content--home' : ''}`}>{children}</main>
      <footer className="site-footer">
        <div className="footer-links"><span>© 2026 Yiran Yang</span><span><a href="/privacy/">Privacy</a></span></div>
      </footer>
    </div>
  </>;
}
