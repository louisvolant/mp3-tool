// src/app/manifest.ts
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MP3 Audio Editor',
    short_name: 'MP3 Editor',
    description:
      'Free online MP3 audio editor: upload a track, visualize its waveform, trim, adjust volume, apply fades and export a new MP3 file — all in your browser.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icon_music.png',
        sizes: '1200x1200',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
