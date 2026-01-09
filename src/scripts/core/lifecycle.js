export function initOnce(el, key, init) {
  if (el[key]) return
  el[key] = true
  init()
}
