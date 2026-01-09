import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

export const isDevelopment = true
export const isProduction = process.env.NODE_ENV === 'production'

export function deepMerge(target, source) {
  const out = Array.isArray(target) ? [...target] : { ...target }
  for (const [key, value] of Object.entries(source || {})) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof out[key] === 'object' &&
      out[key] !== null &&
      !Array.isArray(out[key])
    ) {
      out[key] = this.deepMerge(out[key], value)
    } else {
      out[key] = value
    }
  }
  return out
}

export function getRelativePrefix(filePath, pagesRoot) {
  const rel = path.relative(pagesRoot, filePath)
  if (!rel || rel === '') return './'
  const depth = rel.split(path.sep).length - 1
  return depth > 0 ? '../'.repeat(depth) : './'
}
