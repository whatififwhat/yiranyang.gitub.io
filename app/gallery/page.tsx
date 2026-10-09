import type { Metadata } from 'next';
import { SiteFrame } from '../site-frame';
import { galleryPhotos } from './photos';

export const metadata: Metadata = { title: 'Gallery — Yiran Yang', description: 'Photographs from science outreach, field trips, academic meetings, and travels.', alternates: { canonical: '/gallery/' } };

export default function Page() {
  return <SiteFrame path="/gallery">
    <section aria-labelledby="gallery-title">
      <h1 id="gallery-title">Gallery</h1>
      <div className="gallery-masonry">
        {galleryPhotos.map(photo => <figure className="gallery-figure" key={photo.id}>
          <a href={photo.src} target="_blank" rel="noreferrer" aria-describedby={photo.story.trim() ? `${photo.id}-story` : undefined}>
            <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading={['telescope', 'city-view'].includes(photo.id) ? 'eager' : 'lazy'} decoding="async" />
          </a>
          <figcaption id={`${photo.id}-story`} className="gallery-story" aria-hidden={!photo.story.trim() || undefined}>{photo.story}</figcaption>
        </figure>)}
      </div>
    </section>
  </SiteFrame>;
}
