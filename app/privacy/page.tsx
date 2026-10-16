import { visitorEndpoint } from '@/lib/visitor-config';
import { VisitorPreference } from './visitor-preference';

export const metadata = {
  title: 'Privacy — Yiran Yang',
  robots: { index: false, follow: false },
};

export default function Privacy() {
  const recordsEnabled = Boolean(visitorEndpoint());
  return <main className="utility-page">
    <a href="/">← Back to the website</a>
    <h1>Privacy</h1>
    {recordsEnabled ? <>
      <h2>Visitor records</h2>
      <p>To understand visits to this website, Yiran Yang records the public IP address, server time, and page path of page views using Cloudflare Workers and D1. Cloudflare's approximate IP location (country, state or region, and city), when available, may also be recorded. This describes the network exit location and can be inaccurate, especially when using a VPN or proxy. It does not identify a street address or a person's physical location. This website does not request device GPS location or store coordinates or postal codes. A random event ID prevents duplicate records; it is not saved in your browser or reused across visits. Records are accessible only through the site owner's authorized Cloudflare account.</p>
      <p>Records older than 30 days are removed from the active database by an hourly cleanup job. Cloudflare's recovery backups may retain deleted records for an additional 7 days on its Free plan or 30 days on its Paid plan. See <a href="https://developers.cloudflare.com/d1/reference/time-travel/">Cloudflare's backup documentation</a> and <a href="https://www.cloudflare.com/privacypolicy/">Privacy Policy</a>.</p>
      <p>This website does not use advertising trackers, fingerprinting, or analytics cookies. It does not store query strings, referrers, browser details, or persistent visitor identifiers in visitor records. Do Not Track and Global Privacy Control are respected. You can also exclude this browser below; this stores only an opt-out preference on this device. Clearing your browser storage removes that preference. Opting out does not delete earlier records.</p>
      <VisitorPreference />
    </> : <p>This website does not use visitor analytics, advertising trackers, or fingerprinting. It does not set cookies or store visitor identifiers in your browser.</p>}
    <h2>Hosting</h2>
    <p>This website is hosted on GitHub Pages. GitHub may process technical information, including IP addresses, to operate and secure its service. See the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noreferrer">GitHub General Privacy Statement</a> for details.</p>
    <h2>Contact</h2>
    <p>For privacy questions, contact <a href="mailto:yyran123@mail.ustc.edu.cn">yyran123@mail.ustc.edu.cn</a>.</p>
  </main>;
}
