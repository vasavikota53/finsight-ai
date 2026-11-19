import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatMessage from '../components/ChatMessage.jsx'

// Mock navigator.clipboard with a Vitest spy
const writeTextSpy = vi.fn().mockResolvedValue(undefined)
Object.defineProperty(navigator, 'clipboard', {
  value:    { writeText: writeTextSpy },
  writable: true,
})

const baseUserMsg = {
  id: 'msg-1',
  role: 'user',
  content: 'What was the revenue growth?',
  timestamp: new Date().toISOString(),
}

const baseAiMsg = {
  id: 'msg-2',
  role: 'assistant',
  content: '**Revenue** grew by 23.4% in FY2024.',
  agent: 'research',
  citations: [],
  comparison: null,
  timestamp: new Date().toISOString(),
  error: false,
}

const msgWithCitations = {
  ...baseAiMsg,
  id: 'msg-3',
  citations: [
    {
      document_id:   'doc-1',
      document_name: 'Annual Report FY2024.pdf',
      company:       'Acme Corp',
      page:          42,
      excerpt:       'Revenue grew by 23.4%.',
      file_url:      null,
    },
  ],
}

const errorMsg = {
  id: 'msg-4',
  role: 'assistant',
  content: 'Network error. Please try again.',
  agent: null,
  citations: [],
  comparison: null,
  timestamp: new Date().toISOString(),
  error: true,
}

// ─────────────────────────────────────────────────────────────
describe('ChatMessage — user message', () => {
  it('renders user message content', () => {
    render(<ChatMessage message={baseUserMsg} />)
    expect(screen.getByText('What was the revenue growth?')).toBeInTheDocument()
    expect(screen.getByTestId('user-message')).toBeInTheDocument()
  })

  it('does not render citation list for user message', () => {
    render(<ChatMessage message={baseUserMsg} />)
    expect(screen.queryByTestId('citation-list')).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('ChatMessage — AI message', () => {
  it('renders AI response with markdown', () => {
    render(<ChatMessage message={baseAiMsg} />)
    expect(screen.getByTestId('ai-message')).toBeInTheDocument()
    // Markdown renders "Revenue" as bold
    expect(screen.getByText(/Revenue/)).toBeInTheDocument()
  })

  it('renders agent badge', () => {
    render(<ChatMessage message={baseAiMsg} />)
    expect(screen.getByText('Research Agent')).toBeInTheDocument()
  })

  it('renders copy button', () => {
    render(<ChatMessage message={baseAiMsg} />)
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
  })

  it('copies text on copy button click', async () => {
    const { fireEvent: fe } = await import('@testing-library/react')
    render(<ChatMessage message={baseAiMsg} />)
    const btn = screen.getByRole('button', { name: /copy/i })
    fe.click(btn)
    // Allow the promise to settle
    await new Promise((r) => setTimeout(r, 50))
    expect(writeTextSpy).toHaveBeenCalledWith(baseAiMsg.content)
  })
})

// ─────────────────────────────────────────────────────────────
describe('ChatMessage — citations', () => {
  it('renders citation list when citations are present', () => {
    render(<ChatMessage message={msgWithCitations} onCitationClick={() => {}} />)
    expect(screen.getByTestId('citation-list')).toBeInTheDocument()
    expect(screen.getByText(/Annual Report FY2024/)).toBeInTheDocument()
  })

  it('does not render citation list when no citations', () => {
    render(<ChatMessage message={baseAiMsg} />)
    expect(screen.queryByTestId('citation-list')).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('ChatMessage — error state', () => {
  it('renders error message with retry button', () => {
    const onRetry = vi.fn()
    render(<ChatMessage message={errorMsg} onRetry={onRetry} />)
    expect(screen.getByText('Request Failed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('calls onRetry when retry is clicked', async () => {
    const { fireEvent: fe } = await import('@testing-library/react')
    const onRetry = vi.fn()
    render(<ChatMessage message={errorMsg} onRetry={onRetry} />)
    fe.click(screen.getByRole('button', { name: /retry/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
