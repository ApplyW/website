import { useCallback, useEffect, useState } from 'react'
import logoUrl from './assets/applyw-logo.png'

const STORE_URL = 'https://chromewebstore.google.com/detail/imllbmbpfpgnibchclonahimmkjanjhp'
const REPO_URL = 'https://github.com/ApplyW/extension'
const ISSUES_URL = 'https://github.com/ApplyW/extension/issues'
const PRIVACY_URL = 'https://github.com/ApplyW/extension/blob/main/PRIVACY.md'
const AUTHOR_URL = 'https://www.linkedin.com/in/chudnovskyi/'
const AUTHOR_NAME = 'Viacheslav Chudnovskyi'

// Pacing for the opening sequence. It starts once the page has settled, then works
// through the list fast enough that nobody is left waiting on it.
const CUT_START_MS = 1000
const CUT_INTERVAL_MS = 520
// A beat after the last ribbon lands, the whole set gets straightened — the "someone went
// back and pressed the tape flat" moment. Keep ahead of the slowest ribbon in styles.css.
const SETTLE_MS = 2680

interface Listing {
  title: string
  company: string
  // Why this listing goes, shown once it's cut. `kind` matches the extension's own colour
  // coding: navy marks a blocked company (structural, permanent), blue a job-level removal
  // (light, reversible). Rows without `auto` survive the opening sequence — they're the
  // ones left standing, and they demonstrate the plain Hide button when clicked.
  reason: string
  kind: 'company' | 'job'
  auto?: boolean
}

// One example per filter, so the hero teaches every feature by demonstrating it rather
// than listing it.
const LISTINGS: Listing[] = [
  { title: 'Senior Java Engineer', company: 'Adyen', reason: 'Hidden by you', kind: 'job' },
  { title: 'Java Developer (Junior)', company: 'Sundayy', reason: 'Excluded: Junior', kind: 'job', auto: true },
  {
    title: 'Werkstudent Softwareentwicklung',
    company: 'R+V Versicherung',
    reason: 'Not a language you read',
    kind: 'job',
    auto: true
  },
  { title: 'Software Engineer II', company: 'Booking.com', reason: 'Already viewed', kind: 'job', auto: true },
  { title: 'Backend Engineer', company: 'Jobgether', reason: 'Blocked company', kind: 'company', auto: true },
  { title: 'Platform Engineer', company: 'Station', reason: 'Hidden by you', kind: 'job' }
]

const AUTO_INDEXES = LISTINGS.reduce<number[]>((acc, listing, index) => {
  if (listing.auto) acc.push(index)
  return acc
}, [])

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Same angular beetle as the extension popup: straight segments and flat stroke ends
// only, so it sits in the monogram's geometry rather than looking like a stock glyph.
function BugIcon() {
  return (
    <svg
      className="icon"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 5 17 9v6l-5 5-5-5V9z" />
      <path d="M12 5v15" />
      <path d="M7 10 3 7M7 13H3M7 16l-4 3M17 10l4-3M17 13h4M17 16l4 3" />
      <path d="M10 5 8 2M14 5l2-3" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

export function App() {
  const [hasEntered, setHasEntered] = useState(false)
  const [isSettled, setIsSettled] = useState(false)
  const [cut, setCut] = useState<ReadonlySet<number>>(new Set())
  const [isPlayable, setIsPlayable] = useState(false)
  // Bumping this restarts the opening sequence from scratch.
  const [runId, setRunId] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setHasEntered(true)
      setIsSettled(true)
      return
    }
    const frame = requestAnimationFrame(() => setHasEntered(true))
    const settle = window.setTimeout(() => setIsSettled(true), SETTLE_MS)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(settle)
    }
  }, [])

  // The opening sequence: cuts one listing at a time, then hands control to the visitor.
  useEffect(() => {
    if (prefersReducedMotion()) {
      setCut(new Set(AUTO_INDEXES))
      setIsPlayable(true)
      return
    }

    let step = 0
    let timer = 0
    const tick = () => {
      if (step >= AUTO_INDEXES.length) {
        setIsPlayable(true)
        return
      }
      const index = AUTO_INDEXES[step]
      setCut((previous) => new Set(previous).add(index))
      step += 1
      timer = window.setTimeout(tick, CUT_INTERVAL_MS)
    }

    timer = window.setTimeout(tick, CUT_START_MS)
    return () => window.clearTimeout(timer)
  }, [runId])

  // Hide or bring back a single listing — the extension's own Hide/Unhide, playable
  // before installing anything.
  const toggle = useCallback(
    (index: number) => {
      if (!isPlayable) return
      setCut((previous) => {
        const next = new Set(previous)
        if (next.has(index)) next.delete(index)
        else next.add(index)
        return next
      })
    },
    [isPlayable]
  )

  const replay = (): void => {
    setCut(new Set())
    setIsPlayable(false)
    setRunId((id) => id + 1)
  }

  const shownCount = LISTINGS.length - cut.size

  // Drives the staggered entrance: each element carries its own delay. Kept short and
  // low-travel — a long float upward is the stock landing-page move.
  // Merges with the element's own class rather than replacing it; a spread `className`
  // silently overwrites one written earlier in the same tag.
  const enter = (delayMs: number, base = '') => ({
    className: `${base} enter${hasEntered ? ' is-in' : ''}`.trim(),
    style: { transitionDelay: `${delayMs}ms` }
  })

  return (
    <div className="page">
      {/* Six strips taped around the outside of the viewport. Deliberately lopsided — four
          gathered down the left, two on the right, none the mirror of another — because a
          balanced set reads as placed by a machine. Each is a rotated window with a band
          sliding through it, so it lays itself down from one end like tape. All land
          crooked and get straightened together a beat after the last one arrives.
          Geometry lives in styles.css. */}
      <div
        className={`ribbons${hasEntered ? ' is-in' : ''}${isSettled ? ' is-settled' : ''}`}
        aria-hidden="true"
      >
        <div className="ribbon ribbon-1">
          <span />
        </div>
        <div className="ribbon ribbon-2">
          <span />
        </div>
        <div className="ribbon ribbon-3">
          <span />
        </div>
        <div className="ribbon ribbon-4">
          <span />
        </div>
        <div className="ribbon ribbon-5">
          <span />
        </div>
        <div className="ribbon ribbon-6">
          <span />
        </div>
      </div>

      <header className="nav">
        <a href="/" {...enter(0, 'brand')}>
          <img src={logoUrl} alt="" width={30} height={30} />
          ApplyW
        </a>
        {/* Not a link: there is nothing to navigate to yet, and a dead <a> is worse than
            an honest disabled control. The tooltip shows on hover and on keyboard focus. */}
        <span aria-disabled="true" tabIndex={0} data-tip="coming…" {...enter(60, 'soon')}>
          Metrics
        </span>
      </header>

      <main>
        <section className="hero">
          <div>
            <div {...enter(80, 'mark')} />
            <h1 {...enter(140)}>Cut the noise from LinkedIn job search.</h1>
            {/* The list on the right demonstrates every filter, so the copy doesn't
                enumerate them. The second line is the payoff and carries the weight. */}
            <p {...enter(220, 'lede')}>Hide a job, block a company, filter by language or keyword.</p>
            <p {...enter(280, 'lede-strong')}>It stays that way.</p>

            <div {...enter(360, 'actions')}>
              <a className="button-primary" href={STORE_URL} target="_blank" rel="noopener noreferrer">
                Add to Chrome — it's free
              </a>
            </div>

            <p {...enter(420, 'note')}>Open source. Nothing leaves your browser.</p>
          </div>

          <div {...enter(200, 'cutlist')}>
            <div className="cutlist-head">
              <p className="cutlist-caption">Your LinkedIn results</p>
              {/* Counts down as listings are cut — the whole point of the product, as a number. */}
              <p className="cutlist-count" aria-live="polite">
                Showing <b>{shownCount}</b> of {LISTINGS.length}
              </p>
            </div>

            <ul>
              {LISTINGS.map((listing, index) => {
                const isCut = cut.has(index)
                return (
                  <li key={listing.title} className={isCut ? 'row is-cut' : 'row'}>
                    <button
                      type="button"
                      className="row-button"
                      onClick={() => toggle(index)}
                      disabled={!isPlayable}
                      aria-pressed={isCut}
                      aria-label={`${isCut ? 'Bring back' : 'Hide'} ${listing.title} at ${listing.company}`}
                    >
                      <span className={listing.kind === 'company' ? 'tick' : 'tick tick-signal'} aria-hidden="true" />
                      <span className="row-body">
                        <span className="row-title">{listing.title}</span>
                        <span className="row-company">{listing.company}</span>
                      </span>
                      <span className="row-reason">{listing.reason}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="cutlist-foot">
              <p className="hint" hidden={!isPlayable}>
                Click a row to hide it, or bring it back.
              </p>
              <button type="button" className="replay" onClick={replay} hidden={!isPlayable}>
                Reset
              </button>
            </div>
          </div>
        </section>

      </main>

      <footer className="footer">
        <span className="footer-brand">ApplyW</span>
        <nav className="footer-links">
          {/* Icon-only, so it needs its name announced rather than shown. */}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="ApplyW on GitHub">
            <GitHubIcon />
          </a>
          <span className="sep" aria-hidden="true">
            |
          </span>
          <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
            <BugIcon />
            Report a problem
          </a>
          <span className="sep" aria-hidden="true">
            |
          </span>
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
            Privacy
          </a>
          <span className="sep" aria-hidden="true">
            |
          </span>
          <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer">
            Built by {AUTHOR_NAME}
          </a>
        </nav>
      </footer>
    </div>
  )
}
