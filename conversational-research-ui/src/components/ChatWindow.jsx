import React, { useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage.jsx'
import LoadingIndicator from './LoadingIndicator.jsx'
import WelcomeScreen from './WelcomeScreen.jsx'
import ChatInput from './ChatInput.jsx'
import { AlertCircle, FlaskConical } from 'lucide-react'

/**
 * ChatWindow
 * Main chat area: message list + demo banner + input.
 */
export default function ChatWindow({
  messages,
  isLoading,
  error,
  activeAgent,
  isDemoMode,
  onSend,
  onRetry,
  onCitationClick,
}) {
  const bottomRef = useRef(null)

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-primary)' }}>
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="demo-banner" role="alert">
          <FlaskConical size={13} />
          <strong>Demo Mode</strong>
          &mdash; Responses use fictional companies and illustrative figures. Not real financial research.
          <span className="ml-auto opacity-60">Set VITE_API_BASE_URL to connect your backend.</span>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <WelcomeScreen
            onSuggestedQuestion={onSend}
            isDemoMode={isDemoMode}
          />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onCitationClick={onCitationClick}
                onRetry={msg.error ? onRetry : undefined}
              />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <LoadingIndicator agentName={activeAgent} />
            )}

            {/* Network error (non-message) */}
            {error && !isLoading && messages[messages.length - 1]?.error !== true && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm border"
                style={{
                  background:  '#fef2f2',
                  borderColor: '#fecaca',
                  color:       '#dc2626',
                }}
              >
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="border-t px-4 py-3"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
      >
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={onSend}
            disabled={isLoading}
            placeholder="Ask a financial question about your uploaded documents…"
          />
          <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Answers are grounded in uploaded documents. Always verify figures with original filings.
          </p>
        </div>
      </div>
    </div>
  )
}
