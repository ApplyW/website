# ApplyW — Website

[![Website](https://img.shields.io/badge/website-live-1c6feb.svg)](https://applyw.chudnovskyi-v.workers.dev/)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/imllbmbpfpgnibchclonahimmkjanjhp?color=1c6feb&label=chrome%20web%20store)](https://chromewebstore.google.com/detail/imllbmbpfpgnibchclonahimmkjanjhp)
[![License: MIT](https://img.shields.io/badge/license-MIT-1c6feb.svg)](./LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-1c6feb.svg)](https://github.com/ApplyW/extension/issues)

Marketing site for [ApplyW](https://github.com/ApplyW/extension), a Chrome extension that
declutters LinkedIn's job search page.

**Live:** [applyw.chudnovskyi-v.workers.dev](https://applyw.chudnovskyi-v.workers.dev/) —
deployed on Cloudflare Workers, redeploys on every push to `main`.

## Stack

React, Vite, TypeScript.

## Status

Live, two screens. The landing page says what the extension solves, plays it out in a
mock result list, and links to the store; `/#metrics` reads the visitor's own counts out
of the installed extension and ranks their filters. Both are described below.

It is deliberately a small site: no analytics, no cookies, no form, nothing stored in the
visitor's browser — the extension is sold on "nothing leaves your browser", and a site
that tracked its readers would contradict that in public.

## Setup

```bash
npm install
npm run dev
```

### Testing the metrics page locally

The metrics page reads its numbers from the installed extension, and two things stop that
working against a local build:

1. **The extension id differs.** An unpacked extension gets its own id, and a new one each
   time it is removed and re-added. Copy it from `chrome://extensions` into `.env.local`
   as `VITE_APPLYW_EXTENSION_ID`, then restart the dev server.
2. **The dev server origin has to be allowed.** The extension's `externally_connectable`
   adds `http://localhost:5173/*` in development builds only, so run the extension with
   `npm run dev` (not a production build) and reload it in `chrome://extensions`.

Without both, `/#metrics` correctly shows the "install ApplyW" state — that is the page
working, not failing.

## The page

**On a desktop it never scrolls.** The nav sits against the top of the viewport and the
footer against the bottom, with the hero taking the slack between them. Scroll locking only
applies above 881px wide and 660px tall — below either, including every phone, the content
genuinely cannot fit, and hiding the overflow would put the install button permanently out
of reach, so the page is left free to scroll.

**The hero demonstrates the product instead of describing it.** A mock result list plays
out each filter in turn, striking jobs out one at a time and labelling why each one went
(`Excluded: Junior`, `Not a language you read`, `Already viewed`, `Blocked company`) while
a counter drops from 6 to 2. Once the sequence finishes, every row becomes a toggle — the
extension's own Hide/Unhide, playable before installing anything. That's why the copy is
only two lines: enumerating the filters in prose would say the same thing twice.

## The metrics page

`/#metrics` shows which of the visitor's own filters is hiding the most listings. The data
comes from the installed extension over `chrome.runtime.sendMessage` — a browser-internal
call, not a network request — so there is nothing to show without it. A silent extension
is either missing or too old to answer, and the two are indistinguishable from here, so
the fallback names the version needed rather than telling someone to install what they
may already have.

Two views of one dataset because they answer different questions: a stacked strip for share
of the whole, then ranked bars, which share a baseline and are therefore what you actually
compare lengths against. **Colour is bound to the reason, never to its rank** — the list
re-sorts by count, so if colour followed position a filter would change colour between
visits and mean nothing.

The palette is the validated categorical theme, checked against this page's own surfaces in
both modes. Three light-mode slots fall under 3:1 contrast, which is why every bar carries a
visible label and number — that is required relief, not decoration. Dark mode uses the
documented dark step for slot 1 rather than the brand blue, which sits outside the lightness
band on a dark surface. Re-run the validator before changing any of these values.

## Design

The visual system is shared with the extension popup
([`extension/src/popup/popup.css`](https://github.com/ApplyW/extension/blob/main/src/popup/popup.css))
and comes out of the AW monogram: every stroke in the mark ends in a diagonal cut, so a
small skewed tick (`.tick`) is the one repeated motif. It carries meaning rather than
decoration — navy marks a blocked company, electric blue a hidden job — so don't use it
anywhere that doesn't mean "this was removed". The mark has no curves, hence a 2px radius
throughout and no pill-shaped buttons. Keep the two stylesheets in step.

**Ribbons.** Six strips in the two logo colours tape themselves around the outside of the
viewport, land a degree or two crooked, then straighten together a beat later. Nothing is
shared between them — angle, thickness, length, position, end cuts, timing and entry
direction all differ, and four are gathered down the left against two on the right. A
matched set reads as machine-placed; the point is that they look stuck on by hand. Keep
them asymmetric if you add or move any.

They sit at `z-index: 20`, above the page, so they cross the hero and the result panel.
The nav and footer are lifted to `z-index: 21`: decoration may cross what you read, never
what you have to click.

**Sizing.** Type and spacing use `clamp()` with a floor, a viewport-relative middle and a
ceiling, so nothing jumps at a breakpoint and nothing is oversized on a laptop or lost on
a 4K display. The media queries handle layout only — don't reintroduce font sizes there.

**Phones.** Every rule below 881px is additive, so nothing there can change what a desktop
browser renders — keep it that way. A phone is a different composition rather than a
squeezed desktop one, and the difference is the gutters: on a wide screen the ribbons live
in empty margin, on a phone there is none. So three of the six are dropped and the two that
remain are aimed *through* the corners, where a band shows only as a wedge inside the
page's own padding and never crosses text. Below 620px the cut list's reason moves onto its
own line rather than being hidden — it is what makes the demo legible — and it can do that
for free because the reason is already in the flow at `opacity: 0`, so no row changes
height as the sequence plays. The metrics bars get the same treatment for the same reason:
a bar squeezed to 30px can't be compared with another, so it takes a full-width line.

Motion respects `prefers-reduced-motion` throughout: ribbons already taped down and
straightened, list already filtered, no transitions.

## Deploying

Cloudflare Workers, connected to this repo — pushing to `main` builds and deploys. Build
command `npm run build`, output `dist`. Set `base` in `vite.config.ts` if it is ever served
from a subpath rather than a domain root.

The URL belongs in the Chrome Web Store listing's **Website** field — that is what
publicly ties the site to the extension.

Anything dropped in `public/` is served from the site root, which is how to place a Google
Search Console verification file (no DNS access on a `workers.dev` subdomain).

## Related repositories

- [extension](https://github.com/ApplyW/extension) — the Chrome extension this site is for
- [backend](https://github.com/ApplyW/backend) — not used by this site

## Known gap

This is a client-rendered SPA, so the body content only exists after JavaScript runs.
`<title>` and the meta description in `index.html` are static and index fine, but the
headline and copy depend on rendering. If search ranking starts to matter, convert this
page to static HTML — the design and copy port over unchanged.

## Contributing

Issues and pull requests are welcome. Anything about the extension itself — a bug, a
missing filter — belongs in
[ApplyW/extension](https://github.com/ApplyW/extension/issues), which is where the site's
own "Report a problem" link points.

## License

MIT — see [LICENSE](./LICENSE).
