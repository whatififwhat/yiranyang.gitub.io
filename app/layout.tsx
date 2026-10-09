import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-config';
import './globals.css';
export const metadata: Metadata = {
 title: 'Yiran Yang — Planetary Science',
 description: 'Yiran Yang is a planetary science undergraduate at USTC, exploring planetary interiors, habitability, and the origins of life.',
 metadataBase: new URL(SITE_URL),
 openGraph: {title:'Yiran Yang — Planetary Science',description:'From planetary interiors to prebiotic chemistry.',type:'website'},
 icons:{icon:'/favicon.svg'},
};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
