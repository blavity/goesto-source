import { SELF } from 'cloudflare:test'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { deleteStoredLinks, fetch, postJson, setLinkStoreD1Mode } from '../utils'

// Deliberately literal. The app builds this header from
// runtimeConfig.public.sourceUrl; a test that read the same value would pass
// no matter what that value was. Stating the expectation independently is what
// makes this catch a misconfigured offer.
const SOURCE_URL = 'https://github.com/blavity/goesto-source'
const SOURCE_LINK = `<${SOURCE_URL}>; rel="source"`

const createdSlugs: string[] = []

beforeAll(async () => {
  await setLinkStoreD1Mode()
})

afterAll(async () => {
  await deleteStoredLinks(createdSlugs)
})

describe('source offer (AGPL-3.0)', () => {
  it('advertises the corresponding source on an unknown slug', async () => {
    // AGPL-3.0 section 13: users interacting over a network must be offered
    // the Corresponding Source. Anonymous visitors only ever touch the
    // redirect path, so the offer has to live here rather than on the
    // Access-gated dashboard.
    const res = await SELF.fetch('https://go.blavity.com/no-such-slug-here')
    expect(res.headers.get('link')).toBe(SOURCE_LINK)
  })

  it('advertises it on the root path too', async () => {
    const res = await SELF.fetch('https://go.blavity.com/', { redirect: 'manual' })
    expect(res.headers.get('link')).toBe(SOURCE_LINK)
  })

  it('advertises it on a successful short-link redirect', async () => {
    // The case the other two do not cover, and the only one that is actually
    // the anonymous user's path. A 404 and the root page are edge cases; a
    // real visitor arrives on a slug that resolves, gets a 301, and leaves.
    // If the offer were missing here it would be missing for essentially
    // every user the licence obligation is about.
    const slug = `source-offer-redirect-${crypto.randomUUID()}`
    const url = 'https://example.com/agpl-source-offer'

    const createResponse = await postJson('/api/link/create', { url, slug })
    expect(createResponse.status).toBe(201)
    createdSlugs.push(slug)

    // redirect: 'manual' so the 301 itself is asserted. Auto-following would
    // surface the target's headers, not ours, and the assertion would pass or
    // fail for reasons that have nothing to do with this middleware.
    const res = await fetch(`/${slug}`, { redirect: 'manual' })

    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe(url)
    expect(res.headers.get('link')).toBe(SOURCE_LINK)
  })
})
