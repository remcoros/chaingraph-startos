import { T } from '@start9labs/start-sdk'
import { basename, dirname } from 'node:path'
import {
  rpcHostId,
  rpcPort,
  rpccookiefile,
} from 'bitcoin-core-startos/startos/utils'
import {
  rpcHostId as testnetRpcHostId,
  rpcPort as testnetRpcPort,
  rpccookiefile as testnetCookie,
} from 'bitcoin-core-testnet-startos/startos/utils'
import {
  mainHostId as fulcrumHostId,
  electrumPort,
} from 'fulcrum-startos/startos/utils'
import { sdk } from './sdk'

// The Testnet4 provider still uses an incompatible SDK, so importing its repo
// makes the scaffold's full dependency type-check fail. Verified provider contract:
// https://github.com/remcoros/fulcrum-startos/blob/e1cbc5eaceacdb5266b12ae01d96f46153b412a9/startos/utils.ts
const testnetElectrumPort = 60001

export const uiPort = 3000
export const mainHostId = 'ui'
export const configDirectory = '/run/chaingraph'

export const networks = {
  mainnet: {
    bitcoinId: 'bitcoind',
    rpcHostId,
    rpcPort,
    cookie: rpccookiefile,
    fulcrumId: 'fulcrum',
    fulcrumHostId,
    electrumPort,
  },
  testnet4: {
    bitcoinId: 'bitcoind-testnet',
    rpcHostId: testnetRpcHostId,
    rpcPort: testnetRpcPort,
    cookie: testnetCookie,
    fulcrumId: 'fulcrum-testnet',
    fulcrumHostId,
    electrumPort: testnetElectrumPort,
  },
} as const
export type Network = keyof typeof networks

export const cookieMount = (network: Network) => ({
  mountpoint: `/mnt/bitcoin-${network}`,
  subpath:
    dirname(networks[network].cookie) === '.'
      ? null
      : dirname(networks[network].cookie),
  filename: basename(networks[network].cookie),
})

export async function connection(effects: T.Effects, network: Network) {
  const provider = networks[network]
  const [bitcoin, fulcrum] = await Promise.all([
    sdk.host
      .getBridgeAddress(effects, {
        packageId: provider.bitcoinId,
        hostId: provider.rpcHostId,
        internalPort: provider.rpcPort,
        ssl: false,
      })
      .const(),
    sdk.host
      .getBridgeAddress(effects, {
        packageId: provider.fulcrumId,
        hostId: provider.fulcrumHostId,
        internalPort: provider.electrumPort,
        ssl: false,
      })
      .const(),
  ])
  if (!bitcoin || !fulcrum) return null
  const electrum = new URL(`tcp://${fulcrum}`)
  const cookie = cookieMount(network)
  return {
    network,
    config: [
      `BITCOIN_RPC_URL=http://${bitcoin}`,
      `BITCOIN_RPC_COOKIE_FILE=${cookie.mountpoint}/${cookie.filename}`,
      `FULCRUM_HOST=${electrum.hostname}`,
      `FULCRUM_PORT=${electrum.port}`,
      'FULCRUM_TLS=false',
      'CHAINGRAPH_USE_TXOSPENDERINDEX=false',
      '',
    ].join('\n'),
  }
}

export const allowedOrigins = (effects: T.Effects) =>
  sdk.host
    .getOwn(effects, mainHostId, (host) => {
      const ui = Object.values(host?.bindings ?? {})
        .flatMap((binding) => Object.values(binding.interfaces))
        .find((iface) => iface.id === 'ui')
      return [
        ...new Set(
          ui?.addressInfo.nonLocal
            .format('hostname-info')
            .map((address) => new URL(ui.addressInfo.toUrl(address)).origin) ??
            [],
        ),
      ].sort()
    })
    .const()
