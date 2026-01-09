export default function posthtmlAliases(aliases) {
  return function (tree) {
    tree.walk((node) => {
      if (!node?.attrs) return node

      for (const attr of ['src', 'href']) {
        const value = node.attrs[attr]

        if (!value) continue

        for (const alias in aliases) {
          if (value.startsWith(alias)) {
            node.attrs[attr] = aliases[alias] + value.slice(alias.length)
          }
        }
      }

      return node
    })
  }
}
