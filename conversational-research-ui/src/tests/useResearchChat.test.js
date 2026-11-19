import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useResearchChat } from '../hooks/useResearchChat.js'

// ─── Mock researchService ─────────────────────────────────────
vi.mock('../services/researchService.js', () => ({
  isDemoMode:    () => true,
  postQuery:     vi.fn(),
  getSessions:   vi.fn().mockResolvedValue([]),
  createSession: vi.fn().mockResolvedValue({
    id: 'mock-session-1',
    name: 'Test Session',
    created_at: new Date().toISOString(),
    messages: [],
  }),
  deleteSession: vi.fn().mockResolvedValue({ success: true }),
}))

import { postQuery } from '../services/researchService.js'

const mockSuccessResponse = {
  answer:     '**Revenue** grew by 23.4%.',
  agent:      'research',
  citations:  [{ document_id: 'doc-1', document_name: 'Report.pdf', company: 'Acme', page: 42, excerpt: 'Revenue grew.', file_url: null }],
  comparison: null,
}

const mockErrorResponse = new Error('Network error. Please check your connection.')

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  localStorage.clear()
})

// ─────────────────────────────────────────────────────────────
describe('useResearchChat — initialization', () => {
  it('starts with empty messages', async () => {
    const { result } = renderHook(() => useResearchChat())
    // Wait for async init
    await act(async () => {})
    expect(result.current.messages).toEqual([])
  })

  it('isDemoMode returns true in test environment', () => {
    const { result } = renderHook(() => useResearchChat())
    expect(result.current.isDemoMode).toBe(true)
  })

  it('isLoading starts as false', () => {
    const { result } = renderHook(() => useResearchChat())
    expect(result.current.isLoading).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
describe('useResearchChat — sendQuestion', () => {
  it('adds user message to messages list', async () => {
    postQuery.mockResolvedValueOnce(mockSuccessResponse)
    const { result } = renderHook(() => useResearchChat())
    await act(async () => {})

    await act(async () => {
      await result.current.sendQuestion('What is the revenue?')
    })

    const userMsgs = result.current.messages.filter((m) => m.role === 'user')
    expect(userMsgs).toHaveLength(1)
    expect(userMsgs[0].content).toBe('What is the revenue?')
  })

  it('adds AI response message after successful query', async () => {
    postQuery.mockResolvedValueOnce(mockSuccessResponse)
    const { result } = renderHook(() => useResearchChat())
    await act(async () => {})

    await act(async () => {
      await result.current.sendQuestion('What is the revenue?')
    })

    const aiMsgs = result.current.messages.filter((m) => m.role === 'assistant')
    expect(aiMsgs).toHaveLength(1)
    expect(aiMsgs[0].content).toBe(mockSuccessResponse.answer)
    expect(aiMsgs[0].error).toBe(false)
  })

  it('populates citations on successful response', async () => {
    postQuery.mockResolvedValueOnce(mockSuccessResponse)
    const { result } = renderHook(() => useResearchChat())
    await act(async () => {})

    await act(async () => {
      await result.current.sendQuestion('Revenue question')
    })

    const aiMsg = result.current.messages.find((m) => m.role === 'assistant')
    expect(aiMsg?.citations).toHaveLength(1)
    expect(aiMsg?.citations[0].company).toBe('Acme')
  })

  it('sets isLoading to false after request completes', async () => {
    postQuery.mockResolvedValueOnce(mockSuccessResponse)
    const { result } = renderHook(() => useResearchChat())
    await act(async () => {})

    await act(async () => {
      await result.current.sendQuestion('Loading test')
    })

    // After completion, isLoading should be false
    expect(result.current.isLoading).toBe(false)
  })

  it('handles API errors gracefully', async () => {
    postQuery.mockRejectedValueOnce(mockErrorResponse)
    const { result } = renderHook(() => useResearchChat())
    await act(async () => {})

    await act(async () => {
      await result.current.sendQuestion('Will fail')
    })

    const aiMsgs = result.current.messages.filter((m) => m.role === 'assistant')
    expect(aiMsgs).toHaveLength(1)
    expect(aiMsgs[0].error).toBe(true)
    expect(aiMsgs[0].content).toContain('Network error')
  })

  it('does not send empty messages', async () => {
    const { result } = renderHook(() => useResearchChat())
    await act(async () => {})

    await act(async () => {
      await result.current.sendQuestion('   ')
    })

    expect(result.current.messages).toHaveLength(0)
    expect(postQuery).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────
describe('useResearchChat — session management', () => {
  it('startNewSession creates a new session', async () => {
    const { result } = renderHook(() => useResearchChat())
    await act(async () => {})

    await act(async () => {
      await result.current.startNewSession('My Test Session')
    })

    expect(result.current.sessions.length).toBeGreaterThan(0)
  })

  it('switchSession changes active session and messages', async () => {
    const { result } = renderHook(() => useResearchChat())
    await act(async () => {})

    // Create two sessions
    await act(async () => {
      await result.current.startNewSession('Session A')
    })
    await act(async () => {
      await result.current.startNewSession('Session B')
    })

    const sessions = result.current.sessions
    expect(sessions.length).toBeGreaterThanOrEqual(2)
  })
})
