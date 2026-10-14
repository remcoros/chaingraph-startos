import { sdk } from './sdk'
import { i18n } from './i18n'
import { uiPort, mainHostId } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const origin = await sdk.MultiHost.of(effects, mainHostId).bindPort(uiPort, {
    protocol: 'http',
    preferredExternalPort: uiPort,
  })
  return [
    await origin.export([
      sdk.createInterface(effects, {
        id: 'ui',
        name: i18n('Chaingraph'),
        description: i18n(
          'Watch-only Bitcoin workbench and read-only chain API.',
        ),
        type: 'ui',
        masked: false,
        schemeOverride: null,
        username: null,
        path: '',
        query: {},
      }),
    ]),
  ]
})
