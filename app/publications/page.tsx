import type { Metadata } from 'next';
import { SiteFrame } from '../site-frame';

export const metadata: Metadata = { title: 'Publications — Yiran Yang', description: 'Publications by Yiran Yang on planetary science and habitability.', alternates: { canonical: '/publications/' } };

export default function Page() {
  return <SiteFrame path="/publications">
    <section id="publications" aria-labelledby="publications-title">
        <div className="content-column">
          <h1 id="publications-title">Publications</h1>
          <p className="publication">Zhang, C.†, <strong>Yang, Y.†</strong>, Cai, Y.†, Zhang, S., He, C., Glein, C., Huang, F., Sherwood Lollar, B., &amp; Hao, J. (2026). <a href="https://doi.org/10.1016/j.xinn.2026.101420" target="_blank" rel="noreferrer">Dynamic controls on subsurface water chemistry and habitability on icy moons.</a> <cite>The Innovation</cite>, 7(6), 101420.</p>
          <p className="publication-note">† Co-first authors; equal contribution.</p>
        </div>
          <figure className="publication-figure">
            <a href="/images/icy-moon-habitability.png" target="_blank" rel="noreferrer">
              <img src="/images/icy-moon-habitability.png" alt="Diagram of icy moon interiors, showing subsurface oceans, water–rock interactions, circulation, and the effects of impacts, radiation, and orbital dynamics." width={848} height={544} />
            </a>
          </figure>
        </section>
  </SiteFrame>;
}
