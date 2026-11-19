import React from 'react'
import { Bot } from 'lucide-react'

export default function LoadingIndicator({ agentName }) {
  return (
    <div className="flex items-start gap-3 animate-fade-in" role="status" aria-label="AI is thinking">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Bot size={15} className="text-white" />
      </div>

      {/* Bubble */}
      <div className="chat-bubble-ai flex items-center gap-3 !py-4 !px-5">
        <span className="flex items-center gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {agentName ? `${agentName} is thinking…` : 'Analyzing documents…'}
        </span>
      </div>
    </div>
  )
}
