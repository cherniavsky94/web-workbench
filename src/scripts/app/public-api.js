import { getInstance, getAll } from '../core/registry'

window.App = {
  slider: {
    get(el) {
      return getInstance('slider', el)
    },
    all() {
      return getAll('slider')
    },
  },
}
