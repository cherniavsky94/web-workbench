import { $$ } from '../../core/dom'

export function initMobileMenu(root = document) {
  $$('[data-mobile-menu]', root).forEach((menu) => {
    const toggle = document.querySelector('[data-mobile-menu-toggle]')
    const close = menu.querySelector('[data-mobile-menu-close]')

    if (!toggle) return

    function open() {
      menu.classList.add('is-open')
      toggle.setAttribute('aria-expanded', 'true')
      document.body.classList.add('is-menu-open')
    }

    function closeMenu() {
      menu.classList.remove('is-open')
      toggle.setAttribute('aria-expanded', 'false')
      document.body.classList.remove('is-menu-open')
    }

    toggle.addEventListener('click', () => {
      menu.classList.contains('is-open') ? closeMenu() : open()
    })

    close?.addEventListener('click', closeMenu)

    // ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu()
    })
  })
}
