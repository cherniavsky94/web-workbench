const registry = {
  slider: new Map(),
}

export function registerInstance(type, el, instance) {
  registry[type].set(el, instance)
}

export function getInstance(type, el) {
  return registry[type]?.get(el)
}

export function getAll(type) {
  return Array.from(registry[type]?.values() || [])
}
