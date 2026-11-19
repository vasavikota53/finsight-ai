/**
 * citationUtils.js
 * Helpers for formatting and working with source citations.
 */

/**
 * Format a short citation label: "Company • Doc Name • p.42"
 * @param {Object} citation
 * @returns {string}
 */
export function formatCitationLabel(citation) {
  const parts = []
  if (citation.company)       parts.push(citation.company)
  if (citation.document_name) parts.push(truncate(citation.document_name, 30))
  if (citation.page)          parts.push(`p.${citation.page}`)
  return parts.join(' · ')
}

/**
 * Build a PDF deep-link URL to a specific page (if supported by viewer).
 * Falls back to the base file_url if page anchoring is not possible.
 * @param {string|null} fileUrl
 * @param {number} page
 * @returns {string|null}
 */
export function buildPdfPageUrl(fileUrl, page) {
  if (!fileUrl) return null
  // PDF.js viewer convention: append #page=N
  try {
    const url = new URL(fileUrl)
    url.hash = `page=${page}`
    return url.toString()
  } catch {
    return `${fileUrl}#page=${page}`
  }
}

/**
 * Group an array of citations by document_id.
 * @param {Object[]} citations
 * @returns {Record<string, Object[]>}
 */
export function groupCitationsByDocument(citations) {
  return citations.reduce((acc, c) => {
    const key = c.document_id || c.document_name || 'unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})
}

/**
 * Deduplicate citations by (document_id, page) tuple.
 * @param {Object[]} citations
 * @returns {Object[]}
 */
export function deduplicateCitations(citations) {
  const seen = new Set()
  return citations.filter((c) => {
    const key = `${c.document_id}:${c.page}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Truncate a string to maxLen characters, appending "…" if needed.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(str, maxLen = 50) {
  if (!str) return ''
  return str.length <= maxLen ? str : str.slice(0, maxLen - 1) + '…'
}

/**
 * Returns true if the citation has a usable file URL.
 * @param {Object} citation
 * @returns {boolean}
 */
export function hasPdfLink(citation) {
  return Boolean(citation.file_url)
}

/**
 * Generate an indexed footnote label "[1]", "[2]", etc.
 * @param {number} index (0-based)
 * @returns {string}
 */
export function footnoteLabel(index) {
  return `[${index + 1}]`
}

/**
 * Format a date string to a human-readable relative time.
 * @param {string} isoString
 * @returns {string}
 */
export function formatRelativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return new Date(isoString).toLocaleDateString()
}

/**
 * Format an ISO timestamp to HH:MM.
 * @param {string} isoString
 * @returns {string}
 */
export function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], {
    hour:   '2-digit',
    minute: '2-digit',
  })
}
