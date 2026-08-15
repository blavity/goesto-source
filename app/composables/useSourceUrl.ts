/**
 * Where this deployment's Corresponding Source lives.
 *
 * AGPL-3.0 section 13 obliges us to offer it to users of the running service,
 * and it is surfaced in several places — the `Link: rel="source"` header on the
 * redirect path, the dashboard sidebar, the footer, and the documentation
 * links. Those drifted apart once already, so they read one value.
 *
 * Set `NUXT_PUBLIC_SOURCE_URL` to point a deployment at its own repository; a
 * rename is then a single change rather than a search.
 */
export function useSourceUrl() {
  const sourceUrl = useRuntimeConfig().public.sourceUrl

  return {
    /** The repository itself. */
    sourceUrl,
    /** Documentation published alongside it. */
    docsUrl: `${sourceUrl}/tree/master/docs`,
  }
}
