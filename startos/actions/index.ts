import { sdk } from '../sdk'
import { toggleTestnet4 } from './toggleTestnet4'

export const actions = sdk.Actions.of().addAction(toggleTestnet4)
