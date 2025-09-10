import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chanomhub - GAME H',
    short_name: "Chanomhub",
    description: "Chanomhub, a platform for collecting H games for both mobile and desktop, free, with community participation for language translation and mods.",
    start_url: '/',
    display: 'standalone',
    background_color: '#1E283A',
    theme_color: '#1E283A',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}