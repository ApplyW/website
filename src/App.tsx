import logoUrl from './assets/applyw-logo.png'

const STORE_URL = 'https://chromewebstore.google.com/detail/imllbmbpfpgnibchclonahimmkjanjhp'
const REPO_URL = 'https://github.com/ApplyW/extension'
const ISSUES_URL = 'https://github.com/ApplyW/extension/issues'
const PRIVACY_URL = 'https://github.com/ApplyW/extension/blob/main/PRIVACY.md'
const AUTHOR_URL = 'https://www.linkedin.com/in/chudnovskyi/'
const AUTHOR_NAME = 'Viacheslav Chudnovskyi'

interface Listing {
  title: string
  company: string
  // Absent means the listing survives every filter and stays in your results. The `kind`
  // matches the extension's own colour coding: navy marks a blocked company (structural,
  // permanent), blue marks a job-level removal (light, reversible).
  removedBy?: { label: string; kind: 'company' | 'job' }
}

// Deliberately one example per filter, so the hero teaches what the extension does
// instead of just decorating the page.
const LISTINGS: Listing[] = [
  { title: 'Senior Java Engineer', company: 'Adyen' },
  { title: 'Java Developer (Junior)', company: 'Sundayy', removedBy: { label: 'Excluded: Junior', kind: 'job' } },
  {
    title: 'Werkstudent Softwareentwicklung',
    company: 'R+V Versicherung',
    removedBy: { label: 'Not a language you read', kind: 'job' }
  },
  { title: 'Software Engineer II', company: 'Booking.com', removedBy: { label: 'Already viewed', kind: 'job' } },
  { title: 'Backend Engineer', company: 'Jobgether', removedBy: { label: 'Blocked company', kind: 'company' } },
  { title: 'Platform Engineer', company: 'Station' }
]

export function App() {
  return (
    <div className="page">
      <header className="nav">
        <a className="brand" href="/">
          <img src={logoUrl} alt="" width={30} height={30} />
          ApplyW
        </a>
        {/* Not a link: there's nothing to navigate to yet, and a dead <a> is worse than an
            honest disabled control. The tooltip says so on hover and on keyboard focus. */}
        <span className="soon" aria-disabled="true" tabIndex={0} data-tip="coming…">
          Metrics
        </span>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="mark" />
            <h1>Cut the noise from LinkedIn job search.</h1>
            <p className="lede">
              Postings you've already seen keep resurfacing. Listings turn up in languages you don't read. And when a
              company clearly isn't for you, there's no way to stop seeing them.
            </p>
            <p className="lede">
              ApplyW — Apply Wisely — puts that control on the search page itself. Hide a job and it stays gone. Block a
              company and every listing from them disappears. Filter by language or keyword so you only see work you'd
              actually take.
            </p>

            <div className="actions">
              <a className="button-primary" href={STORE_URL} target="_blank" rel="noopener noreferrer">
                Add to Chrome
              </a>
              <a className="button-quiet" href={REPO_URL} target="_blank" rel="noopener noreferrer">
                View the source
              </a>
            </div>

            <p className="note">Free and open source. No account, no server, nothing sent anywhere.</p>
          </div>

          <div className="cutlist" aria-label="Example of a filtered job search">
            <p className="cutlist-caption">Your results, after ApplyW</p>
            <ul>
              {LISTINGS.map((listing) => (
                <li key={listing.title} className={listing.removedBy ? 'row is-cut' : 'row'}>
                  {listing.removedBy && (
                    <span
                      className={listing.removedBy.kind === 'company' ? 'tick' : 'tick tick-signal'}
                      aria-hidden="true"
                    />
                  )}
                  <span className="row-body">
                    <span className="row-title">{listing.title}</span>
                    <span className="row-company">{listing.company}</span>
                  </span>
                  {listing.removedBy && <span className="row-reason">{listing.removedBy.label}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span className="footer-brand">ApplyW</span>
        <nav className="footer-links">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
            Report a problem
          </a>
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
            Privacy
          </a>
          <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer">
            Built by: {AUTHOR_NAME}
          </a>
        </nav>
      </footer>
    </div>
  )
}
