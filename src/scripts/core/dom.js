export function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector))
}
