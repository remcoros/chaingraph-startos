import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import {
  allowedOrigins,
  configDirectory,
  connection,
  cookieMount,
  networks,
  Network,
  uiPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  const testnet4 =
    (await storeJson.read((s) => s.testnet4Enabled).const(effects)) ?? false
  const selected: Network[] = testnet4 ? ['mainnet', 'testnet4'] : ['mainnet']
  const resolved = await Promise.all(
    selected.map((network) => connection(effects, network)),
  )
  const available = resolved.filter((pair) => pair !== null)
  const origins = await allowedOrigins(effects)

  if (!available.length) {
    return sdk.Daemons.of(effects).addHealthCheck('connections', {
      ready: {
        display: i18n('Chain Connections'),
        fn: () => ({
          result: 'failure',
          message: i18n('Install Bitcoin and Fulcrum to connect Chaingraph.'),
        }),
      },
      requires: [],
    })
  }

  let mounts = sdk.Mounts.of()
  for (const { network } of available) {
    const cookie = cookieMount(network)
    mounts = mounts.mountDependency({
      dependencyId: networks[network].bitcoinId,
      volumeId: 'main',
      subpath: cookie.subpath,
      mountpoint: cookie.mountpoint,
      readonly: true,
      idmap: [{ fromId: 0, toId: 1000 }],
    })
  }
  const app = sdk.SubContainer.of(
    effects,
    { imageId: 'chaingraph' },
    mounts,
    'chaingraph-sub',
  )
  await app.execFail(
    [
      'rm',
      '-f',
      `${configDirectory}/.env.mainnet`,
      `${configDirectory}/.env.testnet4`,
    ],
    { user: 'root' },
  )
  for (const { network, config } of available) {
    await app.writeFile(`${configDirectory}/.env.${network}`, config, {
      mode: 0o644,
    })
  }
  const check = async (path: string, status = false) => {
    const result = await app.exec(
      [
        'node',
        '-e',
        `fetch('http://127.0.0.1:${uiPort}${path}', {signal:AbortSignal.timeout(10000)}).then(async r=>process.exit(r.ok${status ? ' && (await r.json()).connected === true' : ''}?0:1)).catch(()=>process.exit(1))`,
      ],
      { timeout: 15000 },
    )
    return result.exitCode === 0
  }

  return sdk.Daemons.of(effects)
    .addDaemon('chaingraph', {
      subcontainer: app,
      exec: {
        command: ['node', '/app/server.cjs'],
        cwd: '/app',
        env: {
          SERVER_HOST: '0.0.0.0',
          SERVER_PORT: String(uiPort),
          CHAINGRAPH_NETWORK_CONFIG_DIR: configDirectory,
          CORS_ALLOW_ORIGINS: origins.join(','),
        },
        sigtermTimeout: 10000,
      },
      uses: { configs: available, origins },
      ready: {
        display: i18n('Web Interface'),
        fn: async () => {
          const ready = (await check('/')) && (await check('/api/networks'))
          return {
            result: ready ? 'success' : 'failure',
            message: ready
              ? i18n('The web interface is ready.')
              : i18n('The web interface is not ready.'),
          }
        },
      },
      requires: [],
    })
    .addHealthCheck('mainnet', {
      ready: {
        display: i18n('Mainnet Connection'),
        trigger: sdk.trigger.cooldownTrigger(30000),
        fn: async () => {
          const connected = await check('/api/status?network=mainnet', true)
          return {
            result: connected ? 'success' : 'failure',
            message: connected
              ? i18n('Bitcoin and Fulcrum are connected.')
              : i18n(
                  'Check that Bitcoin and Fulcrum are running and synchronized.',
                ),
          }
        },
      },
      requires: ['chaingraph'],
    })
    .addHealthCheck('testnet4', () =>
      testnet4
        ? {
            ready: {
              display: i18n('Testnet4 Connection'),
              trigger: sdk.trigger.cooldownTrigger(30000),
              fn: async () => {
                const connected = await check(
                  '/api/status?network=testnet4',
                  true,
                )
                return {
                  result: connected ? 'success' : 'failure',
                  message: connected
                    ? i18n('Bitcoin and Fulcrum are connected.')
                    : i18n(
                        'Check that Bitcoin and Fulcrum are running and synchronized.',
                      ),
                }
              },
            },
            requires: ['chaingraph'],
          }
        : null,
    )
})
