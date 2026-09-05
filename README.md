# ApplyW — Website

Marketing site for [ApplyW](https://github.com/ApplyW/extension), a Chrome extension that
declutters LinkedIn's job search page.

## Stack

React, Vite, TypeScript.

## Status

🚧 Early development. A single screen: what the extension solves, where to install it, and
where to report a problem. A metrics page is stubbed in the header as unavailable —
`Metrics` is deliberately a `<span>`, not a link, because a dead link is worse than an
honest disabled control.

## Setup

```bash
npm install
npm run dev
```

## The page

**It never scrolls.** The nav sits against the top of the viewport and the footer against
the bottom, with the hero taking the slack between them. Scroll locking only applies above
881px wide and 660px tall — below either, the content genuinely cannot fit, and hiding the
overflow would put the install button permanently out of reach.

**The hero demonstrates the product instead of describing it.** A mock result list plays
out each filter in turn, striking jobs out one at a time and labelling why each one went
(`Excluded: Junior`, `Not a language you read`, `Already viewed`, `Blocked company`) while
a counter drops from 6 to 2. Once the sequence finishes, every row becomes a toggle — the
extension's own Hide/Unhide, playable before installing anything. That's why the copy is
only two lines: enumerating the filters in prose would say the same thing twice.

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

Motion respects `prefers-reduced-motion` throughout: ribbons already taped down and
straightened, list already filtered, no transitions.

## Deploying

Cloudflare Pages, connected to this repo: build `npm run build`, output `dist`. Set
`base` in `vite.config.ts` if it is ever served from a subpath rather than a domain root.

Once live, the URL belongs in the Chrome Web Store listing's **Website** field — that is
what publicly ties the site to the extension.

## Known gap

This is a client-rendered SPA, so the body content only exists after JavaScript runs.
`<title>` and the meta description in `index.html` are static and index fine, but the
headline and copy depend on rendering. If search ranking starts to matter, convert this
page to static HTML — the design and copy port over unchanged.
