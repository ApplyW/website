import { useEffect, useState } from 'react'
import { requestMetrics, type HideReason, type Metrics as MetricsData } from './metricsClient'

const STORE_URL = 'https://chromewebstore.google.com/detail/imllbmbpfpgnibchclonahimmkjanjhp'

// Fixed slot order, and colour follows the reason — never its rank. Sorting the list by
// count must not repaint the bars, or the colours stop meaning anything between visits.
// Palette is the validated categorical theme (see styles.css for the light/dark steps).
const REASONS: { key: HideReason; label: string; note: string }[] = [
  { key: 'manual', label: 'Hidden by you', note: 'You pressed Hide on the card' },
  { key: 'company', label: 'Blocked company', note: 'From a company you blocked' },
  { key: 'excludedWord', label: 'Excluded word', note: 'Matched a word you excluded' },
  { key: 'missingWord', label: 'Missing required word', note: 'Had none of your required words' },
  { key: 'language', label: 'Language', note: 'Not in a language you read' },
  { key: 'applied', label: 'Already applied', note: 'You had already applied' },
  { key: 'viewed', label: 'Already viewed', note: 'You had already seen it' }
]

type State = { status: 'loading' } | { status: 'unavailable' } | { status: 'ready'; data: MetricsData }

function percent(value: number, total: number): string {
  if (total === 0) return '0%'
  const share = (value / total) * 100
  return share < 1 ? '<1%' : `${Math.round(share)}%`
}

export function Metrics() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [isWordsOpen, setIsWordsOpen] = useState(false)

  useEffect(() => {
    void requestMetrics().then((data) => {
      setState(data ? { status: 'ready', data } : { status: 'unavailable' })
    })
  }, [])

  if (state.status === 'loading') {
    return (
      <section className="metrics">
        <h1>Which filters are doing the work</h1>
        <p className="lede">Reading your counts from the extension…</p>
      </section>
    )
  }

  if (state.status === 'unavailable') {
    return (
      <section className="metrics">
        <h1>Which filters are doing the work</h1>
        {/* Covers both "not installed" and "installed but too old to answer" — the two are
            indistinguishable from here, and telling an existing user to install something
            they already have reads as broken. */}
        <p className="lede">
          These numbers live in your own browser, so this page needs ApplyW 0.1.5 or newer to show them. Nothing is
          collected, and nothing is sent anywhere.
        </p>
        <div className="actions">
          <a className="button-primary" href={STORE_URL} target="_blank" rel="noopener noreferrer">
            Add to Chrome — it's free
          </a>
        </div>
      </section>
    )
  }

  const { counts, excludedWordCounts, total } = state.data

  if (total === 0) {
    return (
      <section className="metrics">
        <h1>Which filters are doing the work</h1>
        <p className="lede">
          Nothing counted yet. Open LinkedIn job search with a filter switched on, and this fills in as listings get
          taken out.
        </p>
      </section>
    )
  }

  // Sorted by count to answer "which is most useful", but each row keeps its own slot
  // colour so the ordering can change without the colours meaning something new.
  const ranked = REASONS.map((reason, slot) => ({ ...reason, slot, count: counts[reason.key] ?? 0 }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count)

  const largest = ranked[0]?.count ?? 1
  const words = Object.entries(excludedWordCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
  const mostWords = words[0]?.[1] ?? 1

  return (
    <section className="metrics">
      <h1>Which filters are doing the work</h1>
      <p className="metrics-total">
        <b>{total.toLocaleString()}</b> listings kept out of your results
      </p>

      {/* The whole, split by cause — share at a glance. The ranked bars below are what
          you actually compare with, since they share a baseline. */}
      <div className="stack" role="img" aria-label={`Hidden listings by cause, ${total} in total`}>
        {ranked.map((row) => (
          <span
            key={row.key}
            className={`stack-part slot-${row.slot}`}
            style={{ flexGrow: row.count }}
            title={`${row.label}: ${row.count}`}
          />
        ))}
      </div>

      <ol className="ranks">
        {ranked.map((row) => (
          <li key={row.key}>
            <div className="rank-row">
              <span className={`swatch slot-${row.slot}`} aria-hidden="true" />
              <span className="rank-label">
                {row.label}
                <span className="rank-note">{row.note}</span>
              </span>
              <span className="rank-bar" aria-hidden="true">
                <span className={`rank-fill slot-${row.slot}`} style={{ width: `${(row.count / largest) * 100}%` }} />
              </span>
              <span className="rank-value">
                <b>{row.count.toLocaleString()}</b>
                <span className="rank-share">{percent(row.count, total)}</span>
              </span>
            </div>

            {row.key === 'excludedWord' && words.length > 0 && (
              <div className="words">
                <button type="button" className="words-toggle" onClick={() => setIsWordsOpen((open) => !open)} aria-expanded={isWordsOpen}>
                  {isWordsOpen ? 'Hide' : 'Show'} the {words.length} word{words.length === 1 ? '' : 's'} behind this
                </button>

                {isWordsOpen && (
                  <>
                    <ul className="word-list">
                      {words.map(([word, count]) => (
                        <li key={word}>
                          <span className="word-name">{word}</span>
                          <span className="rank-bar" aria-hidden="true">
                            <span className="rank-fill slot-2" style={{ width: `${(count / mostWords) * 100}%` }} />
                          </span>
                          <b className="word-count">{count.toLocaleString()}</b>
                        </li>
                      ))}
                    </ul>
                    <p className="words-note">
                      A listing can match several of your words at once, so these add up to more than the
                      {' '}
                      {counts.excludedWord.toLocaleString()} above.
                    </p>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
