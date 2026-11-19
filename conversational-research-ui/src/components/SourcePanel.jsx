import React from 'react'
import { X, FileText, ExternalLink, BookOpen } from 'lucide-react'
import { buildPdfPageUrl, hasPdfLink } from '../utils/citationUtils.js'

/**
 * SourcePanel
 * Slide-in panel showing full citation details.
 */
export default function SourcePanel({ citation, onClose }) {
  if (!citation) return null
  const pdfUrl  = buildPdfPageUrl(citation.file_url, citation.page)
  const hasLink = hasPdfLink(citation)

  return (
    <>
      {/* Backdrop */}
      <div
        className="source-panel-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside className="source-panel" role="complementary" aria-label="Source details">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b sticky top-0"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={16} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Source Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Close source panel"
          >
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Document info */}
          <div
            className="rounded-xl p-4 border"
            style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent)', opacity: 0.9 }}
              >
                <FileText size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {citation.document_name ?? 'Unknown Document'}
                </p>
                {citation.company && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {citation.company}
                  </p>
                )}
                {citation.page && (
                  <p className="text-xs mt-1 font-medium" style={{ color: 'var(--accent)' }}>
                    Page {citation.page}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Excerpt */}
          {citation.excerpt && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Supporting Evidence
              </h3>
              <blockquote
                className="text-sm leading-relaxed rounded-lg p-4 italic border-l-4"
                style={{
                  background:    'var(--bg-tertiary)',
                  borderColor:   'var(--accent)',
                  color:         'var(--text-secondary)',
                  borderRadius:  '0 0.5rem 0.5rem 0',
                }}
              >
                {citation.excerpt}
              </blockquote>
            </div>
          )}

          {/* No excerpt */}
          {!citation.excerpt && (
            <div
              className="rounded-lg p-4 text-sm text-center"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
            >
              No excerpt available for this citation.
            </div>
          )}

          {/* PDF Link */}
          {hasLink && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <ExternalLink size={14} />
              Open PDF — Page {citation.page}
            </a>
          )}

          {/* Disclaimer */}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            This citation is sourced from the uploaded document. Verify figures against the original filing before making financial decisions.
          </p>
        </div>
      </aside>
    </>
  )
}
