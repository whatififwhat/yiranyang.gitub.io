import type { Metadata } from 'next';
import { SiteFrame } from '../site-frame';

export const metadata: Metadata = { title: 'Contact — Yiran Yang', description: 'Contact Yiran Yang at the University of Science and Technology of China in Hefei.', alternates: { canonical: '/contact/' } };

export default function Page() {
  return <SiteFrame path="/contact">
    <section aria-labelledby="contact-title">
      <h1 id="contact-title">Contact</h1>
      <p>Email: <a href="mailto:yyran123@mail.ustc.edu.cn">yyran123@mail.ustc.edu.cn</a></p>
      <p>University of Science and Technology of China<br />Hefei, China</p>
    </section>
  </SiteFrame>;
}
