# Sink — Blavity

The link shortener behind [go.blavity.com](https://go.blavity.com).

This is a **modified version of [Sink](https://github.com/miantiao-me/Sink)**,
originally by [miantiao-me](https://github.com/miantiao-me). Modified by
Blavity Inc., 2026. Sink is a fast, self-hosted link shortener with analytics
that runs entirely on Cloudflare — all of the interesting engineering here is
upstream's, and their documentation at [docs.sink.cool](https://docs.sink.cool)
is the reference for how it works.

## Why this repository exists

Sink is licensed under **AGPL-3.0**. We run a modified copy of it as a network
service, so section 13 obliges us to offer its users the Corresponding Source.
This repository is that offer.

It is published automatically from our private working repository, with
internal operational material removed. The application code, schemas,
migrations, tests, translations and configuration that make up the running
service are all here.

## What we changed

Very little. As of this writing the differences from upstream are:

- an AGPL source-offer link in the dashboard and a `Link: rel="source"` header
  on the redirect path, so users of the running service can find this repository
- removal of outbound requests to third-party services — link icons, referrer
  icons, operator avatars and an update check — that disclosed operational data
- removal of upstream's donation link, which is theirs and not ours to present
- deployment configuration for our own Cloudflare account
- test and build configuration

## Contributing

**Do not open pull requests against `master`.** This branch is republished by
automation from our private repository, and anything pushed here is discarded
on the next publication.

If you have found a bug in Sink itself, or want to improve it, please take it
to **[miantiao-me/Sink](https://github.com/miantiao-me/Sink)**. That is the
upstream project, it is where the code is actually maintained, and improvements
there reach everyone running Sink rather than only us.

If the issue is specific to our deployment at `go.blavity.com`, it is not an
upstream problem — contact us directly.

## Licence

AGPL-3.0. See [`LICENSE`](./LICENSE). Upstream's copyright is retained; our
modifications are released under the same licence.

Corresponding Source: <https://github.com/blavity/sink-source>
