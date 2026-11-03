import { readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guards `patches/source-map-resolve@0.6.0.patch`.
 *
 * `decode-uri-component` 0.5.x is ESM-only. Node 22's `require()` returns the
 * module namespace, and `source-map-resolve` calls that value while reading an
 * external source map. Without the patch that throws
 * `TypeError: decodeUriComponentLib is not a function`.
 *
 * See the comment on this entry in `pnpm-workspace.yaml`.
 */

interface SourceMapResolve {
  resolveSourceMapSync: (
    code: string,
    codeUrl: string,
    read: (url: string) => string,
  ) => { url: string, map: unknown }
}

function loadSourceMapResolve(): SourceMapResolve {
  const store = join(process.cwd(), 'node_modules/.pnpm')
  const entry = readdirSync(store).find(name => name.startsWith('source-map-resolve@0.6.0_patch_hash='))
  if (!entry)
    throw new Error('patched source-map-resolve@0.6.0 is not installed')

  const require = createRequire(join(store, entry, 'node_modules/source-map-resolve/package.json'))
  return require('source-map-resolve') as SourceMapResolve
}

describe('source-map-resolve decode-uri-component patch', () => {
  it('decodes an external source map URL instead of throwing', () => {
    const sourceMapResolve = loadSourceMapResolve()
    const reads: string[] = []
    const code = 'a{}\n/*# sourceMappingURL=foo%20bar.css.map */'

    const result = sourceMapResolve.resolveSourceMapSync(code, 'file:///css/app.css', (url) => {
      reads.push(url)
      return '{"version":3,"sources":[],"names":[],"mappings":""}'
    })

    expect(reads).toEqual(['file:///css/foo bar.css.map'])
    expect(result.url).toBe('file:///css/foo%20bar.css.map')
    expect(result.map).toEqual({ version: 3, sources: [], names: [], mappings: '' })
  })
})
