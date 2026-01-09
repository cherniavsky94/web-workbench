export const sliderConfigs = {
  hero: {
    type: 'loop',
    perPage: 1,
    autoplay: true,
    interval: 5000,
    arrows: false,
    pagination: true,
  },

  product: {
    type: 'slide',
    perPage: 4,
    gap: '16px',
    breakpoints: {
      1024: { perPage: 2 },
      640: { perPage: 1 },
    },
  },

  gallery: {
    type: 'loop',
    perPage: 'auto',
    gap: '8px',
    focus: 'center',
  },
}
