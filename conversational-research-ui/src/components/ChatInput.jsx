import React, { useRef, useEffect } from 'react'
import { Send, Paperclip } from 'lucide-react'

/**
 * ChatInput
 * Auto-resizing textarea. Enter = send, Shift+Enter = newline.
 */
export default function ChatInput({ onSend, disabled, placeholder }) {
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
  })

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const val = textareaRef.current?.value?.trim()
    if (!val || disabled) return
    onSend(val)
    if (textareaRef.current) {
      textareaRef.current.value = ''
      textareaRef.current.style.height = 'auto'
    }
  }

  return (
    <div className="chat-input-area p-2 flex items-end gap-2">
      <textarea
        ref={textareaRef}
        id="chat-input"
        rows={1}
        disabled={disabled}
        placeholder={placeholder ?? 'Ask a financial research question…'}
        onKeyDown={handleKeyDown}
        className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed py-2 px-2"
        style={{ color: 'var(--text-primary)', maxHeight: '180px', minHeight: '36px' }}
        aria-label="Research question input"
        aria-multiline="true"
      />
      <button
        id="send-button"
        onClick={submit}
        disabled={disabled}
        className="p-2.5 rounded-xl transition-all duration-150 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
        style={{ background: 'var(--accent)', color: '#fff' }}
        aria-label="Send message"
      >
        <Send size={16} />
      </button>
    </div>
  )
}
