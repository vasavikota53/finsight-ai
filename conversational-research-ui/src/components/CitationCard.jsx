import React from 'react'
import { FileText, ExternalLink, ChevronRight } from 'lucide-react'
import { formatCitationLabel, truncate, buildPdfPageUrl, hasPdfLink, footnoteLabel } from '../utils/citationUtils.js'

/**
 * CitationCard
 * Compact clickable card showing one source citation.
 */
export default function CitationCard({ citation, index, onClick }) {
  const label   = formatCitationLabel(citation)
  const pdfUrl  = buildPdfPageUrl(citation.file_url, citation.page)
  const hasLink = hasPdfLink(citation)

  return (
    <div
      className="citation-card group"
      onClick={() => onClick?.(citation)}
      role="button"
      tabIndex={0}
      aria-label={`Open source: ${label}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(citation) }}
    >
      {/* Footnote index */}
      <span
        className="text-xs font-bold flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        {footnoteLabel(index ?? 0)}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <FileText size={11} style={{ color: 'var(--accent)' }} className="flex-shrink-0" />
          <span className="font-medium truncate" style={{ color: 'var(--text-primary)', fontSize: '0.72rem' }}>
            {truncate(citation.document_name, 32)}
          </span>
          {citation.page && (
            <span
              className="px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0"
              style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
            >
              p.{citation.page}
            </span>
          )}
        </div>
        {citation.company && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
            {citation.company}
          </p>
        )}
        {citation.excerpt && (
          <p className="text-xs mt-1 italic line-clamp-2" style={{ color: 'var(--text-muted)' }}>
            "{truncate(citation.excerpt, 100)}"
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <ChevronRight
          size={13}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--accent)' }}
        />
        {hasLink && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-0.5 text-xs hover:underline"
            style={{ color: 'var(--accent)', fontSize: '0.65rem' }}
            aria-label="Open PDF"
          >
            <ExternalLink size={9} />
            PDF
          </a>
        )}
      </div>
    </div>
  )
}
