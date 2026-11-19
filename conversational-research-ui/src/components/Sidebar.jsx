import React, { useState } from 'react'
import {
  TrendingUp, Plus, MessageSquare, ChevronLeft, ChevronRight,
  Trash2, Settings, FileText, Moon, Sun, MoreHorizontal, X
} from 'lucide-react'
import { formatRelativeTime, truncate } from '../utils/citationUtils.js'

/**
 * Sidebar
 * Collapsible sidebar with sessions, documents section, and settings.
 */
export default function Sidebar({
  sessions,
  activeSessionId,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  isDemoMode,
  theme,
  onToggleTheme,
  documentCount,
  onToggleDocuments,
}) {
  const [collapsed, setCollapsed]       = useState(false)
  const [deletingId, setDeletingId]     = useState(null)
  const [hoveredId, setHoveredId]       = useState(null)

  async function confirmDelete(e, id) {
    e.stopPropagation()
    if (!window.confirm('Delete this research session?')) return
    setDeletingId(id)
    await onDeleteSession(id)
    setDeletingId(null)
  }

  return (
    <aside
      className={`flex flex-col h-full transition-all duration-250 relative flex-shrink-0 ${
        collapsed ? 'w-14' : 'w-72'
      }`}
      style={{ background: 'var(--bg-sidebar)' }}
      aria-label="Sidebar navigation"
    >
      {/* ── Top: Logo ─────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}
        >
          <TrendingUp size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">FinResearch AI</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Financial Research</p>
          </div>
        )}
      </div>

      {/* ── New Research button ───────────────────────── */}
      <div className="px-3 py-3 flex-shrink-0">
        <button
          id="new-research-btn"
          onClick={onNewSession}
          className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium
            transition-all duration-150 hover:opacity-90 active:scale-95 ${collapsed ? 'justify-center' : ''}`}
          style={{ background: 'var(--accent)', color: '#fff' }}
          aria-label="New research session"
          title="New Research"
        >
          <Plus size={16} />
          {!collapsed && 'New Research'}
        </button>
      </div>

      {/* ── Sessions list ─────────────────────────────── */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {/* Section header */}
          <p
            className="text-xs font-semibold uppercase tracking-widest px-2 py-2"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Recent Sessions
          </p>

          {sessions.length === 0 && (
            <p className="text-xs px-2 py-4 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
              No sessions yet. Start a new research.
            </p>
          )}

          {sessions.map((s) => {
            const isActive = s.id === activeSessionId
            const isDeleting = s.id === deletingId
            return (
              <div
                key={s.id}
                className="relative group"
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <button
                  id={`session-${s.id}`}
                  onClick={() => onSelectSession(s.id)}
                  disabled={isDeleting}
                  className={`sidebar-link w-full text-left relative ${isActive ? 'active' : ''} ${isDeleting ? 'opacity-40' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Session: ${s.name}`}
                >
                  <MessageSquare size={14} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium leading-tight">{truncate(s.name, 28)}</p>
                    {s.preview && (
                      <p className="truncate text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {truncate(s.preview, 35)}
                      </p>
                    )}
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {formatRelativeTime(s.created_at)}
                    </p>
                  </div>
                </button>

                {/* Delete button */}
                {hoveredId === s.id && (
                  <button
                    onClick={(e) => confirmDelete(e, s.id)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                    aria-label={`Delete session ${s.name}`}
                    title="Delete session"
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Bottom actions ─────────────────────────────── */}
      <div
        className="px-3 py-3 space-y-1 border-t flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {/* Documents toggle */}
        <button
          onClick={onToggleDocuments}
          className={`sidebar-link w-full ${collapsed ? 'justify-center' : ''}`}
          title="Documents"
          aria-label="Toggle document panel"
        >
          <FileText size={16} />
          {!collapsed && (
            <span className="flex-1 text-left">Documents</span>
          )}
          {!collapsed && documentCount > 0 && (
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {documentCount}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className={`sidebar-link w-full ${collapsed ? 'justify-center' : ''}`}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
        </button>

        {/* Settings (placeholder) */}
        <button
          className={`sidebar-link w-full ${collapsed ? 'justify-center' : ''}`}
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={16} />
          {!collapsed && 'Settings'}
        </button>

        {isDemoMode && !collapsed && (
          <div
            className="mt-2 px-2 py-1.5 rounded-lg text-xs text-center"
            style={{ background: '#f59e0b18', color: '#fbbf24' }}
          >
            ⚡ Demo Mode
          </div>
        )}
      </div>

      {/* ── Collapse toggle ───────────────────────────── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border flex items-center justify-center transition-all hover:scale-110 z-10"
        style={{
          background:  'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          color:        'var(--text-muted)',
          boxShadow:   'var(--shadow-sm)',
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
