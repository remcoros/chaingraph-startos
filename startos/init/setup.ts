import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

export const setup = sdk.setupOnInit(async (effects) => {
  await storeJson.merge(effects, {})
})
