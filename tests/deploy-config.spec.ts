import { parse, printParseErrorCode } from 'jsonc-parser'
import { describe, expect, it } from 'vitest'
// @ts-expect-error - Vite `?raw` import; inlined at bundle time so this works
// inside the @cloudflare/vitest-pool-workers sandbox, which has no disk access.
import wranglerSource from '../wrangler.jsonc?raw'

// Upstream's placeholder ids. scripts/cloudflare-deploy-config.mjs replaces these
// from Doppler at build time; the committed file must never carry a real id.
const PLACEHOLDER_D1_ID = 'ef964055-65bf-4b78-b109-ac9c9290ae62'
const PLACEHOLDER_KV_ID = 'ef93d42dc4b34969bab404d2e80f8dd3'

const parseErrors: { error: number, offset: number }[] = []
const config = parse(wranglerSource as string, parseErrors, { allowTrailingComma: true })

describe('wrangler.jsonc runtime posture', () => {
  it('is valid JSONC', () => {
    // jsonc-parser returns a partial object on error rather than throwing, so
    // without this every other assertion here could fail for a misleading reason.
    expect(parseErrors.map(e => `${printParseErrorCode(e.error)} at offset ${e.offset}`)).toEqual([])
  })

  it('disables the workers.dev subdomain', () => {
    // Cloudflare Access is path-scoped to go.blavity.com/dashboard* and /api*.
    // A live goesto.<subdomain>.workers.dev hostname would serve the dashboard
    // with no Access application in front of it.
    expect(config.workers_dev).toBe(false)
  })

  it('runs the Worker before assets so short links resolve', () => {
    // These two are a pair. single-page-application not-found handling WITHOUT
    // run_worker_first serves index.html for an unmatched /:slug, so the request
    // never reaches server/middleware/1.redirect.ts and every short link
    // silently becomes the dashboard shell. Change both or neither.
    expect(config.assets.not_found_handling).toBe('single-page-application')
    expect(config.assets.run_worker_first).toBe(true)
  })

  it('keeps production resource ids out of the committed config', () => {
    // Asserts the exact placeholders rather than blocklisting known-production
    // ids: a blocklist only catches the ids someone thought to add, so the first
    // real id committed for a resource nobody listed would pass silently.
    const d1 = config.d1_databases.find((b: { binding: string }) => b.binding === 'DB')
    expect(d1.database_name).toBe('goesto')
    expect(d1.database_id).toBe(PLACEHOLDER_D1_ID)

    const kv = config.kv_namespaces.find((b: { binding: string }) => b.binding === 'KV')
    expect(kv.id).toBe(PLACEHOLDER_KV_ID)
    expect(kv.preview_id).toBe(PLACEHOLDER_KV_ID)
  })

  it('names every committed resource fallback consistently', () => {
    // These are the values wrangler dev uses, and the ones a deploy env falls
    // back to when a DEPLOY_* variable is missing. They are not placeholders,
    // so nothing above catches them drifting from the real resource names.
    const d1 = config.d1_databases.find((b: { binding: string }) => b.binding === 'DB')
    expect(d1.database_name).toBe('goesto')

    const analytics = config.analytics_engine_datasets.find(
      (b: { binding: string }) => b.binding === 'ANALYTICS',
    )
    expect(analytics.dataset).toBe('goesto')

    const r2 = config.r2_buckets.find((b: { binding: string }) => b.binding === 'R2')
    expect(r2.bucket_name).toBe('goesto')
    expect(r2.preview_bucket_name).toBe('goesto')
  })
})
