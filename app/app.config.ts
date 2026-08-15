export default defineAppConfig({
  title: 'Sink',
  documentation: 'https://github.com/blavity/sink-source/tree/master/docs',
  github: 'https://github.com/blavity/sink-source',
  description: 'A Simple / Speedy / Secure Link Shortener with Analytics, 100% run on Cloudflare.',
  image: '/banner.png',
  previewTTL: 300, // 5 minutes
  slugRegex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
  reserveSlug: [
    'dashboard',
  ],
})
