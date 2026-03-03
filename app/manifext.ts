import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Das Internationale Bauhaus-Kolloquium in Weimar 1976–2019',
    short_name: 'Bauhaus-Kolloquium Archiv',
    description:
      'Archiv der Bauhaus Kolloquien an der Bauhaus-Universität in Weimar 1976 bis 2019',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
