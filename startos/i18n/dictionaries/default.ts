export const DEFAULT_LANG = 'en_US'

const dict = {
  Chaingraph: 0,
  'Watch-only Bitcoin workbench and read-only chain API.': 1,
  'Enable Testnet4': 2,
  'Disable Testnet4': 3,
  'Toggle the Testnet4 Bitcoin and Fulcrum connections.': 4,
  'Testnet4 Enabled': 5,
  'Testnet4 Disabled': 6,
  'Start Chaingraph to use these settings.': 7,
  'Provides Bitcoin chain data through read-only RPC requests.': 8,
  'Provides address history, balances, and unspent outputs.': 9,
  'Chaingraph needs transaction indexing and an unpruned Bitcoin node.': 10,
  'Chain Connections': 11,
  'Install Bitcoin and Fulcrum to connect Chaingraph.': 12,
  'Web Interface': 13,
  'The web interface is ready.': 14,
  'The web interface is not ready.': 15,
  'Mainnet Connection': 16,
  'Testnet4 Connection': 17,
  'Bitcoin and Fulcrum are connected.': 18,
  'Check that Bitcoin and Fulcrum are running and synchronized.': 19,
} as const

export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
