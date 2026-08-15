# Sink — Blavity

The link shortener behind [go.blavity.com](https://go.blavity.com).

This is a **modified version of [Sink](https://github.com/miantiao-me/Sink)**,
originally by [miantiao-me](https://github.com/miantiao-me), modified by
Blavity Inc. since August 2026. Sink is a self-hosted link shortener with
analytics that runs on Cloudflare Workers.

It is a hard fork: maintained here, not tracking upstream. The original design
and most of this code are theirs.

## Why this repository exists

Sink is licensed under **AGPL-3.0**. We run a modified copy of it as a network
service, so section 13 obliges us to offer its users the Corresponding Source.
This repository is that offer.

It is published automatically from our private working repository, with
internal operational material removed. The application code, schemas,
migrations, tests, translations and configuration that make up the running
service are all here.

## What we changed

- an AGPL source-offer link in the dashboard and a `Link: rel="source"` header
  on the redirect path, so users of the running service can find this repository
- removed every outbound request to a third-party service — link icons,
  referrer icons, operator avatars, an update check and a repository-stats
  call. The application now makes no third-party requests from the browser
- removed upstream's donation link, social links and testimonials, which are
  theirs to present and not ours
- deployment configuration for our own Cloudflare account, and our own test and
  build configuration

## Contributing

Open pull requests against the **`contributions`** branch. `master` is
regenerated automatically and anything on it gets overwritten, so PRs there
won't survive.

## Licence

AGPL-3.0. See [`LICENSE`](./LICENSE). Upstream's copyright is retained; our
modifications are released under the same licence.

Corresponding Source: <https://github.com/blavity/sink-source>
