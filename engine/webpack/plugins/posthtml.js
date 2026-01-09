import path from 'node:path'
import fs from 'node:fs'
import fg from 'fast-glob'
import posthtml from 'posthtml'
import component from 'posthtml-component'
import beautify from 'posthtml-beautify'
import aliases from '../../posthtml/plugins/posthtml-aliases.js'
import { __dirname, deepMerge, getRelativePrefix, isProduction } from '../../helpers.js'
import injectAssets from '../../posthtml/plugins/inject-assets.js'

export class WebpackPostHtmlPlugin {
  constructor(options) {
    this.pagesDir = options.pagesDir
    this.templatesDir = options.templatesDir
    this.dataDir = options.dataDir || path.resolve(__dirname, 'src/data')
    this._assets = { js: [], css: [] }
    this._currentData = {}
  }

  async loadDataFiles() {
    const dataFiles = await fg(['**/*.json'], {
      cwd: this.dataDir,
      absolute: true,
      dot: false,
      ignore: ['**/_*.*'],
    })

    const all = {}

    for (const file of dataFiles.sort()) {
      try {
        const relPath = path.relative(this.dataDir, file)
        const parsed = path.parse(relPath)

        // folder structure → array
        const folders = parsed.dir ? parsed.dir.split(path.sep) : []

        // filename without extension
        const key = parsed.name

        const json = JSON.parse(fs.readFileSync(file, 'utf-8'))

        this.setByPath(all, [...folders, key], json)
      } catch (e) {
        const rel = path.relative(__dirname, file)
        const msg = `\x1b[31m[data]\x1b[0m error in ${rel}: ${e.message}`

        if (isProduction) {
          throw new Error(msg)
        } else {
          console.warn(msg)
        }
      }
    }

    return {
      data: all,
      files: dataFiles,
    }
  }

  setByPath(target, pathArray, value) {
    let current = target

    for (let i = 0; i < pathArray.length; i++) {
      const key = pathArray[i]

      if (i === pathArray.length - 1) {
        current[key] = value
      } else {
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {}
        }
        current = current[key]
      }
    }
  }

  renderHtml(filePath) {
    const html = fs.readFileSync(filePath, 'utf-8')

    const pagesRoot = path.resolve(this.templatesDir, 'pages')
    const relativePrefix = getRelativePrefix(filePath, pagesRoot)

    const plugins = this.buildPosthtmlPipeline({ relativePrefix })

    const result = posthtml(plugins).process(html, {
      from: filePath,
      sync: true,
    })

    return result.html
  }

  buildPosthtmlPipeline({ relativePrefix }) {
    const plugins = [
      component({
        root: this.templatesDir,
        folders: ['layouts', 'partials', 'components'],
        expressions: {
          locals: this._currentData || {},
          strictMode: false,
        },
        namespaces: [
          {
            name: 'layout',
            root: path.resolve(__dirname, 'src/templates/layouts'),
            fallback: this.templatesDir,
          },
        ],
      }),

      aliases({
        '@assets': `${relativePrefix}assets`,
      }),

      injectAssets({
        assets: this._assets,
        relativePrefix,
      }),
    ]

    if (isProduction) {
      plugins.push(beautify())
    }

    return plugins
  }

  getEntryAssetFiles(compilation, entryName) {
    const entry = compilation.entrypoints.get(entryName)
    if (!entry) return []

    const files = entry.getFiles()

    return {
      js: files.filter((file) => file.endsWith('.js')),
      css: files.filter((file) => file.endsWith('.css')),
    }
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap('HtmlPagesPlugin', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'HtmlPagesPlugin',
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async () => {
          // 1) Собираем все страницы
          const pages = await fg('**/*.html', {
            cwd: this.pagesDir,
            absolute: true,
          })

          // 2) Регистрируем зависимости шаблонов, чтобы watch/devServer реагировали
          const templateGlobs = ['layouts/**/*.html', 'partials/**/*.html', 'components/**/*.html']

          const templateFiles = await fg(templateGlobs, {
            cwd: this.templatesDir,
            absolute: true,
            dot: false,
          })

          // 2.1) Собираем данные и список файлов данных
          const { data, files: dataFiles } = await this.loadDataFiles()
          this._currentData = data

          // Добавляем все html-файлы в зависимости компиляции
          for (const file of [...pages, ...templateFiles, ...dataFiles]) {
            compilation.fileDependencies.add(file)
          }

          // сохраняем в инстанс плагина
          this._assets = this.getEntryAssetFiles(compilation, 'main')

          for (const file of pages) {
            const renderedHtml = await this.renderHtml(file)

            const relativePath = path.relative(this.pagesDir, file).replace(/\\/g, '/')

            // Эмитим html-страницу в dist и логируем путь
            compilation.emitAsset(
              relativePath,
              new compiler.webpack.sources.RawSource(renderedHtml)
            )

            // Информативный лог в консоль Webpack какой html был собран
            console.log(`\x1b[36m[html]\x1b[0m emitted: /${relativePath}`)
          }
        }
      )
    })
  }
}
