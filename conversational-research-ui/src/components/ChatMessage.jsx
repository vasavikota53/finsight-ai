import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { Copy, Check, RefreshCw, AlertTriangle, User, Bot } from 'lucide-react'
import AgentBadge from './AgentBadge.jsx'
import CitationCard from './CitationCard.jsx'
import ComparisonTable from './ComparisonTable.jsx'
import { formatTime, deduplicateCitations } from '../utils/citationUtils.js'

/**
 * ChatMessage
 * Renders a single user or assistant message.
 */
export default function ChatMessage({ message, onCitationClick, onRetry }) {
  const [copied, setCopied] = useState(false)
  const isUser      = message.role === 'user'
  const isError     = message.error
  const citations   = deduplicateCitations(message.citations ?? [])
  const hasInsufficient = !isUser && !isError && citations.length === 0 &&
    message.content?.toLowerCase().includes('insufficient information')

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 animate-slide-up" data-testid="user-message">
        <div className="flex flex-col items-end gap-1 max-w-[80%]">
          <div className="chat-bubble-user">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatTime(message.timestamp)}
          </span>
        </div>
        {/* User avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 self-end"
          style={{ background: 'var(--border-color)' }}
        >
          <User size={15} style={{ color: 'var(--text-secondary)' }} />
        </div>
      </div>
    )
  }

  // ── AI Message ────────────────────────────────────────────
  return (
    <div className="flex items-start gap-3 animate-slide-up" data-testid="ai-message">
      {/* AI avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{
          background: isError
            ? 'linear-gradient(135deg,#ef4444,#dc2626)'
            : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
        }}
      >
        {isError
          ? <AlertTriangle size={15} className="text-white" />
          : <Bot size={15} className="text-white" />
        }
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        {/* Agent badge + timestamp */}
        <div className="flex items-center gap-2 flex-wrap">
          {message.agent && !isError && <AgentBadge agent={message.agent} />}
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Error state */}
        {isError ? (
          <div
            className="rounded-xl px-4 py-3 border text-sm"
            style={{
              background:  '#fef2f2',
              borderColor: '#fecaca',
              color:       '#dc2626',
            }}
          >
            <p className="font-medium mb-1">Request Failed</p>
            <p className="text-xs opacity-80">{message.content}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium hover:underline"
                style={{ color: '#dc2626' }}
              >
                <RefreshCw size={11} />
                Retry
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Answer bubble */}
            <div className="chat-bubble-ai">
              <div className="markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              {/* Comparison table */}
              {message.comparison && (
                <ComparisonTable
                  data={message.comparison}
                  onCitationClick={onCitationClick}
                />
              )}
            </div>

            {/* Citations */}
            {citations.length > 0 && (
              <div className="space-y-1.5" data-testid="citation-list">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Sources
                </p>
                <div className="space-y-1.5">
                  {citations.map((cit, i) => (
                    <CitationCard
                      key={`${cit.document_id}-${cit.page}-${i}`}
                      citation={cit}
                      index={i}
                      onClick={onCitationClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Insufficient info notice */}
            {hasInsufficient && (
              <div
                className="rounded-lg px-3 py-2 text-xs border flex items-center gap-2"
                style={{
                  background:  'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color:       'var(--text-muted)',
                }}
              >
                <AlertTriangle size={12} />
                No supporting citations found in the uploaded documents.
              </div>
            )}

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs py-1 px-2.5 rounded-lg transition-all hover:opacity-80"
              style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)' }}
              aria-label="Copy response"
            >
              {copied
                ? <><Check size={11} className="text-green-500" /> Copied</>
                : <><Copy size={11} /> Copy</>
              }
            </button>
          </>
        )}
      </div>
    </div>
  )
}
