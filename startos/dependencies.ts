import { T } from '@start9labs/start-sdk'
import { autoconfig } from 'bitcoin-core-startos/startos/actions/config/autoconfig'
import { autoconfig as testnetAutoconfig } from 'bitcoin-core-testnet-startos/startos/actions/config/autoconfig'
import { sdk } from './sdk'
import { i18n } from './i18n'
import { storeJson } from './fileModels/store.json'

const bitcoinMetadata = {
  description: i18n(
    'Provides Bitcoin chain data through read-only RPC requests.',
  ),
  metadata: {
    title: 'Bitcoin',
    icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/next/31.x/icon.svg',
  },
  versionRange: '>=31.1:0',
  kind: 'running' as const,
  healthChecks: ['bitcoind'],
}
const fulcrumMetadata = {
  description: i18n('Provides address history, balances, and unspent outputs.'),
  metadata: {
    title: 'Fulcrum',
    icon: 'https://raw.githubusercontent.com/Start9Labs/fulcrum-startos/next/icon.png',
  },
  versionRange: '>=2.1.3:1',
  kind: 'running' as const,
  healthChecks: ['primary', 'sync-progress'],
}
const testnetEnabled = async ({ effects }: { effects: T.Effects }) =>
  (await storeJson.read((s) => s.testnet4Enabled).const(effects)) ?? false

export const dependencies = sdk.Dependencies.of()
  .addDependency(
    sdk.Dependency.required('bitcoind', bitcoinMetadata).withInit(
      async (effects) => {
        await sdk.action.createTask(
          effects,
          'bitcoind',
          autoconfig,
          'critical',
          {
            input: {
              kind: 'partial',
              accept: [{ prune: 0, txindex: true }],
              set: { prune: 0, txindex: true },
            },
            reason: i18n(
              'Chaingraph needs transaction indexing and an unpruned Bitcoin node.',
            ),
            when: { condition: 'input-not-matches', once: false },
          },
        )
      },
    ),
  )
  .addDependency(sdk.Dependency.required('fulcrum', fulcrumMetadata))
  .addDependency(
    sdk.Dependency.optional('bitcoind-testnet', {
      ...bitcoinMetadata,
      metadata: {
        ...bitcoinMetadata.metadata,
        title: 'Bitcoin Testnet4',
        icon: 'https://raw.githubusercontent.com/remcoros/bitcoind-testnet4-startos/31.x-testnet4/icon.svg',
      },
      versionRange: '>=31.1:1',
      enabled: testnetEnabled,
    }).withInit(async (effects) => {
      await sdk.action.createTask(
        effects,
        'bitcoind-testnet',
        testnetAutoconfig,
        'critical',
        {
          input: {
            kind: 'partial',
            accept: [{ prune: 0, txindex: true }],
            set: { prune: 0, txindex: true },
          },
          reason: i18n(
            'Chaingraph needs transaction indexing and an unpruned Bitcoin node.',
          ),
          when: { condition: 'input-not-matches', once: false },
        },
      )
    }),
  )
  .addDependency(
    sdk.Dependency.optional('fulcrum-testnet', {
      ...fulcrumMetadata,
      metadata: {
        ...fulcrumMetadata.metadata,
        title: 'Fulcrum Testnet4',
        icon: 'https://raw.githubusercontent.com/remcoros/fulcrum-startos/testnet4/icon.png',
      },
      versionRange: '>=2.1.1:2',
      enabled: testnetEnabled,
    }),
  )
