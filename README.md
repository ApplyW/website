# ApplyW — Website

Marketing site for [ApplyW](https://github.com/ApplyW/extension), a Chrome extension that
declutters LinkedIn's job search page.

## Stack

React, Vite, TypeScript.

## Status

🚧 Early development. One page: what the extension solves, where to install it, and where
to report a problem. A metrics page is stubbed in the header as unavailable.

## Setup

```bash
npm install
npm run dev
```

## Design

The visual system is shared with the extension popup
([`extension/src/popup/popup.css`](https://github.com/ApplyW/extension/blob/main/src/popup/popup.css))
and comes out of the AW monogram: every stroke in the mark ends in a diagonal cut, so a
small skewed tick (`.tick`) is the one repeated motif. It carries meaning rather than
decoration — navy marks a blocked company, electric blue a hidden job — so don't use it
anywhere that doesn't mean "this was removed". The mark has no curves, hence a 2px radius
throughout and no pill-shaped buttons. Keep the two stylesheets in step.

Before publishing, set `AUTHOR_URL` in `src/App.tsx` to the real profile link.
