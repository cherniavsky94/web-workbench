import Splide from '@splidejs/splide'
import { sliderConfigs } from './config'
import { $$ } from '../../core/dom'
import { initOnce } from '../../core/lifecycle'
import { registerInstance } from '../../core/registry'

export function initSliders(root = document) {
  $$('[data-slider]', root).forEach((el) => {
    initOnce(el, '_splide', () => {
      const type = el.dataset.slider
      const baseConfig = sliderConfigs[type]

      if (!baseConfig) {
        console.warn(`[slider] Unknown slider type: ${type}`)
        return
      }

      // overrides (опционально)
      const config = {
        ...baseConfig,
        perPage: el.dataset.perPage ? Number(el.dataset.perPage) : baseConfig.perPage,
      }

      const instance = new Splide(el, config)
      instance.mount()

      registerInstance('slider', el, instance)
    })
  })
}
