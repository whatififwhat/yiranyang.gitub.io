import type { Metadata } from 'next';
import { SiteFrame } from '../site-frame';

export const metadata: Metadata = { title: 'Grants — Yiran Yang', description: 'Research funding awarded to Yiran Yang, including an NSFC Undergraduate Basic Research Project.', alternates: { canonical: '/grants/' } };

export default function Page() {
  return <SiteFrame path="/grants">
    <section aria-labelledby="grants-title">
      <h1 id="grants-title">Grants</h1>
      <article className="grant-entry">
        <h2>Undergraduate Basic Research Project</h2>
        <p className="project-meta"><strong>2025–2026 · CNY 100,000</strong></p>
        <p>National Natural Science Foundation of China (NSFC)</p>
        <p>Selected as one of 150 undergraduate recipients nationwide across all disciplines.</p>
      </article>
    </section>
  </SiteFrame>;
}
