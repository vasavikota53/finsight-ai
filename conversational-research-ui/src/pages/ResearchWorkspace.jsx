import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import ChatWindow from '../components/ChatWindow.jsx'
import SourcePanel from '../components/SourcePanel.jsx'
import DocumentSelector from '../components/DocumentSelector.jsx'
import { useResearchChat } from '../hooks/useResearchChat.js'
import { X, FileText, PanelRight } from 'lucide-react'

/**
 * ResearchWorkspace
 * Top-level page composing Sidebar + ChatWindow + panels.
 */
export default function ResearchWorkspace({ theme, onToggleTheme }) {
  const [showDocuments, setShowDocuments] = useState(false)

  const {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    error,
    activeAgent,
    selectedDocIds,
    sourcePanelCitation,
    isDemoMode,
    setSelectedDocIds,
    setSourcePanelCitation,
    sendQuestion,
    startNewSession,
    switchSession,
    removeSession,
  } = useResearchChat()

  // Mobile: auto-close doc panel on send
  function handleSend(question) {
    if (window.innerWidth < 768) setShowDocuments(false)
    sendQuestion(question)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ──────────────────────────────────── */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewSession={startNewSession}
        onSelectSession={switchSession}
        onDeleteSession={removeSession}
        isDemoMode={isDemoMode}
        theme={theme}
        onToggleTheme={onToggleTheme}
        documentCount={selectedDocIds.length}
        onToggleDocuments={() => setShowDocuments((v) => !v)}
      />

      {/* ── Main content ─────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Document selector panel */}
        {showDocuments && (
          <div
            className="w-72 flex-shrink-0 flex flex-col border-r h-full"
            style={{
              background:  'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
          >
            {/* Panel header */}
            <div
              className="flex items-center gap-2 px-3 py-3 border-b flex-shrink-0"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <FileText size={15} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
                Documents
              </span>
              <button
                onClick={() => setShowDocuments(false)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Close document panel"
              >
                <X size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <DocumentSelector
                selectedIds={selectedDocIds}
                onSelectionChange={setSelectedDocIds}
              />
            </div>
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 overflow-hidden relative">
          {/* Header bar */}
          <div
            className="flex items-center gap-3 px-4 h-14 border-b flex-shrink-0"
            style={{
              background:  'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {sessions.find((s) => s.id === activeSessionId)?.name ?? 'Financial Research'}
              </p>
              {selectedDocIds.length > 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {selectedDocIds.length} document{selectedDocIds.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
            <button
              onClick={() => setShowDocuments((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showDocuments ? 'bg-blue-500/15 text-blue-500' : ''
              }`}
              style={!showDocuments ? { color: 'var(--text-secondary)', background: 'var(--bg-tertiary)' } : {}}
              aria-label="Toggle documents panel"
            >
              <PanelRight size={13} />
              Docs
              {selectedDocIds.length > 0 && (
                <span
                  className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  {selectedDocIds.length}
                </span>
              )}
            </button>
          </div>

          {/* Chat window */}
          <div style={{ height: 'calc(100% - 3.5rem)' }}>
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              error={error}
              activeAgent={activeAgent}
              isDemoMode={isDemoMode}
              onSend={handleSend}
              onRetry={() => {
                const lastUser = [...messages].reverse().find((m) => m.role === 'user')
                if (lastUser) sendQuestion(lastUser.content)
              }}
              onCitationClick={setSourcePanelCitation}
            />
          </div>
        </div>
      </div>

      {/* Source panel (slide-in) */}
      {sourcePanelCitation && (
        <SourcePanel
          citation={sourcePanelCitation}
          onClose={() => setSourcePanelCitation(null)}
        />
      )}
    </div>
  )
}
