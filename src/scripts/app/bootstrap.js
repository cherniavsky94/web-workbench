import { mountPlugins } from './plugins'
import { mountUI } from '../ui'
import './public-api'

export function bootstrap(root = document) {
  mountPlugins(root)
  mountUI(root)
}
