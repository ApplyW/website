// Asks the installed extension for the visitor's own counts.
//
// This is a browser-internal message, not a network request: chrome.runtime.sendMessage
// with an extension id reaches the extension's background worker directly, and only
// because its manifest names this exact origin in `externally_connectable`. Nothing is
// sent to a server, and no data about anyone reaches us.

const EXTENSION_ID = 'imllbmbpfpgnibchclonahimmkjanjhp'
// If the extension is missing, Chrome usually calls back with lastError set — but on some
// versions it simply never calls back at all, so a timeout is what stops the page sitting
// on "Loading" forever.
const REPLY_TIMEOUT_MS = 2000

export type HideReason =
  | 'manual'
  | 'company'
  | 'excludedWord'
  | 'missingWord'
  | 'language'
  | 'applied'
  | 'viewed'

export interface Metrics {
  counts: Record<HideReason, number>
  excludedWordCounts: Record<string, number>
  total: number
}

interface ChromeRuntime {
  sendMessage?: (
    extensionId: string,
    message: unknown,
    callback: (response: Metrics | null) => void
  ) => void
  lastError?: { message?: string }
}

function getRuntime(): ChromeRuntime | undefined {
  return (window as unknown as { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime
}

/** Resolves with the counts, or null when the extension isn't installed or doesn't answer. */
export function requestMetrics(): Promise<Metrics | null> {
  return new Promise((resolve) => {
    const runtime = getRuntime()
    if (!runtime?.sendMessage) {
      resolve(null)
      return
    }

    let isSettled = false
    const settle = (value: Metrics | null): void => {
      if (isSettled) return
      isSettled = true
      resolve(value)
    }

    const timer = setTimeout(() => settle(null), REPLY_TIMEOUT_MS)

    try {
      runtime.sendMessage(EXTENSION_ID, { type: 'applyw:getMetrics' }, (response) => {
        clearTimeout(timer)
        // Reading lastError is what stops Chrome logging "Unchecked runtime.lastError" to
        // the console when the extension isn't there. The value itself doesn't matter.
        void runtime.lastError
        settle(response ?? null)
      })
    } catch {
      clearTimeout(timer)
      settle(null)
    }
  })
}
