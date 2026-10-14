import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'chaingraph',
  title: 'Chaingraph',
  license: 'MIT',
  packageRepo: 'https://github.com/remcoros/chaingraph-startos',
  upstreamRepo: 'https://github.com/remcoros/chaingraph',
  marketingUrl: 'https://github.com/remcoros/chaingraph',
  donationUrl: null,
  description: { short, long },
  volumes: ['startos'],
  images: {
    chaingraph: {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
