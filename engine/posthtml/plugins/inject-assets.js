export default function injectAssets({ assets, relativePrefix }) {
  return (tree) => {
    const { js, css } = assets

    if (!js.length && !css.length) return tree

    tree.walk((node) => {
      // комментарии в PostHTML — это строки
      if (typeof node === 'string') {
        const jsMatch = node.match(/<!--\s*js:include\s*-->/)
        const cssMatch = node.match(/<!--\s*css:include\s*-->/)

        if (jsMatch) {
          return [
            '\n',
            ...js.map((src) => ({
              tag: 'script',
              attrs: {
                src: `${relativePrefix}${src}`,
                defer: true,
              },
            })),
            '\n',
          ]
        } else if (cssMatch) {
          return [
            '\n',
            ...css.map((href) => ({
              tag: 'link',
              attrs: {
                rel: 'stylesheet',
                href: `${relativePrefix}${href}`,
              },
            })),
            '\n',
          ]
        }
      }

      return node
    })

    return tree
  }
}
