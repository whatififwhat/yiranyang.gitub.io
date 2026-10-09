import type { Metadata } from 'next';
import { SiteFrame } from './site-frame';

export const metadata: Metadata = {title: 'Yiran Yang — Planetary Science', alternates: {canonical: '/'}};

export default function Home() {
  return <SiteFrame path="/">
    <section id="about" aria-labelledby="about-title" className="home-introduction">
      <h1 id="about-title" className="visually-hidden">Yiran Yang</h1>
      <div className="introduction-layout">
        <div className="home-copy">
          <div className="introduction-copy">
            <p>I am an undergraduate student in Planetary Science at the <a href="https://en.ustc.edu.cn/" target="_blank" rel="noreferrer">University of Science and Technology of China (USTC)</a>, with graduation expected in 2027.</p>
            <p>My <a href="/research/">research</a> combines computational modeling and laboratory experiments to study planetary environments and prebiotic chemistry.</p>
          </div>
          <section id="interests" className="home-interests" aria-labelledby="interests-title">
            <h2 id="interests-title">Research Interests</h2>
            <ul className="interests-list">
              <li><strong>Origin of Life:</strong> prebiotic chemistry, compartment formation, and the emergence of chemical complexity.</li>
              <li><strong>Ab initio Calculation:</strong> first-principles calculations, machine-learned interatomic potentials, and material properties under planetary conditions.</li>
              <li><strong>Habitability:</strong> planetary evolution, water–rock interactions, and environmental controls on the conditions for life.</li>
            </ul>
          </section>
        </div>
        <img className="profile-photo" src="/images/yiran-yang.png" alt="Portrait in front of a rocky mountain landscape." width={1445} height={1088} fetchPriority="high" />
      </div>
    </section>
  </SiteFrame>;
}
