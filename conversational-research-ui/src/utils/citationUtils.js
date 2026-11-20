
/**
 * citationUtils.js
 * Helpers for formatting and working with source citations.
 */

/**
 * Format a short citation label.
 * Example: "Apple · Annual Report · p.42"
 *
 * @param {Object} citation
 * @returns {string}
 */
export function formatCitationLabel(citation) {
  const parts = []

  if (citation.company) {
    parts.push(citation.company)
  }

  if (citation.document_name) {
    parts.push(truncate(citation.document_name, 30))
  }

  if (citation.page) {
    parts.push(`p.${citation.page}`)
  }

  return parts.join(' · ')
}

/**
 * Build a PDF deep-link URL to a specific page.
 * Falls back to the base file URL when necessary.
 *
 * @param {string|null} fileUrl
 * @param {number} page
 * @returns {string|null}
 */
export function buildPdfPageUrl(fileUrl, page) {
  if (!fileUrl) return null

  try {
    const url = new URL(fileUrl)
    url.hash = `page=${page}`
    return url.toString()
  } catch {
    return `${fileUrl}#page=${page}`
  }
}

/**
 * Group citations by document ID.
 *
 * @param {Object[]} citations
 * @returns {Record<string, Object[]>}
 */
export function groupCitationsByDocument(citations) {
  return citations.reduce((acc, citation) => {
    const key =
      citation.document_id ||
      citation.document_name ||
      'unknown'

    if (!acc[key]) {
      acc[key] = []
    }

    acc[key].push(citation)

    return acc
  }, {})
}

/**
 * Deduplicate citations by document ID and page.
 *
 * @param {Object[]} citations
 * @returns {Object[]}
 */
export function deduplicateCitations(citations) {
  const seen = new Set()

  return citations.filter((citation) => {
    const key = `${citation.document_id}:${citation.page}`

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

/**
 * Safely truncate a value to maxLen characters.
 *
 * Fixes:
 * "Uncaught TypeError: str.slice is not a function"
 *
 * Handles strings, numbers, objects, null and undefined.
 *
 * @param {unknown} value
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(value, maxLen = 50) {
  const str =
    value == null
      ? ''
      : typeof value === 'string'
        ? value
        : String(value)

  const limit = Number.isFinite(maxLen)
    ? Math.max(0, Math.floor(maxLen))
    : 50

  if (str.length <= limit) {
    return str
  }

  if (limit === 0) {
    return ''
  }

  if (limit === 1) {
    return '…'
  }

  return str.slice(0, limit - 1) + '…'
}

/**
 * Returns true if the citation has a usable file URL.
 *
 * @param {Object} citation
 * @returns {boolean}
 */
export function hasPdfLink(citation) {
  return Boolean(citation.file_url)
}

/**
 * Generate an indexed footnote label.
 *
 * @param {number} index
 * @returns {string}
 */
export function footnoteLabel(index) {
  return `[${index + 1}]`
}

/**
 * Format a date string to a human-readable relative time.
 *
 * @param {string} isoString
 * @returns {string}
 */
export function formatRelativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()

  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) {
    return 'just now'
  }

  if (mins < 60) {
    return `${mins}m ago`
  }

  if (hours < 24) {
    return `${hours}h ago`
  }

  if (days < 7) {
    return `${days}d ago`
  }

  return new Date(isoString).toLocaleDateString()
}

/**
 * Format an ISO timestamp to HH:MM.
 *
 * @param {string} isoString
 * @returns {string}
 */
export function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
