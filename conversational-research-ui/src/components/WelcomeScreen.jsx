import React from 'react'
import { TrendingUp, Search, BarChart2, AlertTriangle, ArrowRightLeft, FileText } from 'lucide-react'
import { SUGGESTED_QUESTIONS } from '../data/demoData.js'

const ICON_MAP = { '📈': TrendingUp, '⚖️': ArrowRightLeft, '⚠️': AlertTriangle, '📊': BarChart2, '💳': Search, '💰': FileText }

/**
 * WelcomeScreen
 * Shown when no messages exist in the current session.
 */
export default function WelcomeScreen({ onSuggestedQuestion, isDemoMode }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12 animate-fade-in">
      {/* Logo mark */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-glow"
        style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}
      >
        <TrendingUp size={30} className="text-white" />
      </div>

      <h1 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
        FinResearch AI
      </h1>
      <p className="text-center text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
        Multi-Agent Financial Research System
      </p>
      <p className="text-center text-xs mb-8 max-w-sm" style={{ color: 'var(--text-muted)' }}>
        Ask financial questions about uploaded company reports. All answers are grounded in your documents with source citations.
      </p>

      {isDemoMode && (
        <div
          className="mb-6 px-4 py-2 rounded-full text-xs font-medium border"
          style={{
            background:  '#f59e0b18',
            borderColor: '#f59e0b44',
            color:       '#d97706',
          }}
        >
          ⚡ Demo Mode — using illustrative fictional data
        </div>
      )}

      {/* Suggested questions */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SUGGESTED_QUESTIONS.map((q) => {
          const Icon = ICON_MAP[q.icon] ?? TrendingUp
          return (
            <button
              key={q.id}
              id={`suggested-${q.id}`}
              onClick={() => onSuggestedQuestion(q.text)}
              className="flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-150
                         hover:border-blue-400 hover:shadow-sm hover:scale-[1.01] active:scale-100"
              style={{
                background:  'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent)', opacity: 0.85 }}
              >
                <Icon size={15} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--accent)' }}>{q.label}</p>
                <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>{q.text}</p>
              </div>
            </button>
          )
        })}
      </div>

      <p className="mt-8 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Press <kbd className="px-1.5 py-0.5 rounded border text-xs" style={{ borderColor: 'var(--border-color)' }}>Enter</kbd> to send &nbsp;·&nbsp;
        <kbd className="px-1.5 py-0.5 rounded border text-xs" style={{ borderColor: 'var(--border-color)' }}>Shift+Enter</kbd> for new line
      </p>
    </div>
  )
}
