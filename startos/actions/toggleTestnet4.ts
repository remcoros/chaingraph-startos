import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'

export const toggleTestnet4 = sdk.Action.withoutInput(
  'toggle-testnet4',
  async ({ effects }) => ({
    name: (await storeJson.read((s) => s.testnet4Enabled).const(effects))
      ? i18n('Disable Testnet4')
      : i18n('Enable Testnet4'),
    description: i18n('Toggle the Testnet4 Bitcoin and Fulcrum connections.'),
    warning: null,
    allowedStatuses: 'only-stopped',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const enabled = !(await storeJson.read((s) => s.testnet4Enabled).once())
    await storeJson.merge(effects, { testnet4Enabled: enabled })
    return {
      version: '1',
      title: enabled ? i18n('Testnet4 Enabled') : i18n('Testnet4 Disabled'),
      message: i18n('Start Chaingraph to use these settings.'),
      result: null,
    }
  },
)
