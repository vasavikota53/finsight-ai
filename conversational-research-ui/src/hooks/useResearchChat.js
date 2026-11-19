/**
 * useResearchChat.js
 * Core hook managing chat state, session persistence, and API calls.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { postQuery, getSessions, createSession, deleteSession, isDemoMode } from '../services/researchService.js'

const STORAGE_KEY = 'finresearch_sessions'

// ─── Helpers ─────────────────────────────────────────────────
function newMessageId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
function newSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function loadPersistedSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    /* storage quota exceeded — ignore */
  }
}

// ─────────────────────────────────────────────────────────────
export function useResearchChat() {
  const [sessions, setSessions]               = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages]               = useState([])
  const [isLoading, setIsLoading]             = useState(false)
  const [error, setError]                     = useState(null)
  const [selectedDocIds, setSelectedDocIds]   = useState([])
  const [activeAgent, setActiveAgent]         = useState(null)
  const [sourcePanelCitation, setSourcePanelCitation] = useState(null)
  const abortRef = useRef(null)

  // ── Load sessions on mount ────────────────────────────────
  useEffect(() => {
    async function init() {
      if (isDemoMode()) {
        const persisted = loadPersistedSessions()
        if (persisted.length > 0) {
          setSessions(persisted)
          setActiveSessionId(persisted[0].id)
          setMessages(persisted[0].messages || [])
        }
        return
      }
      try {
        const serverSessions = await getSessions()
        setSessions(serverSessions)
        if (serverSessions.length > 0) {
          setActiveSessionId(serverSessions[0].id)
        }
      } catch {
        // Backend not available; silently start empty
      }
    }
    init()
  }, [])

  // ── Persist sessions to localStorage ─────────────────────
  useEffect(() => {
    if (isDemoMode() && sessions.length > 0) {
      persistSessions(sessions)
    }
  }, [sessions])

  // ── Computed: active session object ──────────────────────
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null

  // ── Start a new session ──────────────────────────────────
  const startNewSession = useCallback(async (name = 'New Research') => {
    try {
      let session
      if (isDemoMode()) {
        session = {
          id:         newSessionId(),
          name,
          created_at: new Date().toISOString(),
          preview:    '',
          messages:   [],
        }
      } else {
        session = await createSession(name)
        session.messages = []
      }
      setSessions((prev) => [session, ...prev])
      setActiveSessionId(session.id)
      setMessages([])
      setError(null)
      setActiveAgent(null)
      return session
    } catch (err) {
      setError(err.message)
    }
  }, [])

  // ── Switch to an existing session ────────────────────────
  const switchSession = useCallback((sessionId) => {
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) return
    setActiveSessionId(sessionId)
    setMessages(session.messages || [])
    setError(null)
    setActiveAgent(null)
  }, [sessions])

  // ── Remove a session ─────────────────────────────────────
  const removeSession = useCallback(async (sessionId) => {
    if (!isDemoMode()) {
      try { await deleteSession(sessionId) } catch { /* ignore */ }
    }
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId)
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id)
        setMessages(remaining[0].messages || [])
      } else {
        setActiveSessionId(null)
        setMessages([])
      }
    }
  }, [activeSessionId, sessions])

  // ── Update messages in session store ─────────────────────
  const updateSessionMessages = useCallback((sessionId, msgs) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        const preview = msgs.find((m) => m.role === 'user')?.content?.slice(0, 80) ?? s.preview
        return { ...s, messages: msgs, preview }
      })
    )
  }, [])

  // ── Send a question ──────────────────────────────────────
  const sendQuestion = useCallback(async (question) => {
    if (!question.trim() || isLoading) return

    // Ensure a session exists
    let sessionId = activeSessionId
    let currentMessages = messages

    if (!sessionId) {
      const session = await startNewSession(question.slice(0, 60))
      if (!session) return
      sessionId = session.id
      currentMessages = []
    }

    setError(null)
    setActiveAgent(null)

    // Append user message
    const userMsg = {
      id:         newMessageId(),
      role:       'user',
      content:    question,
      timestamp:  new Date().toISOString(),
    }
    const newMessages = [...currentMessages, userMsg]
    setMessages(newMessages)
    updateSessionMessages(sessionId, newMessages)
    setIsLoading(true)

    try {
      const response = await postQuery(sessionId, question, selectedDocIds)
      setActiveAgent(response.agent)

      const aiMsg = {
        id:         newMessageId(),
        role:       'assistant',
        content:    response.answer,
        agent:      response.agent,
        citations:  response.citations ?? [],
        comparison: response.comparison ?? null,
        timestamp:  new Date().toISOString(),
        error:      false,
      }

      const finalMessages = [...newMessages, aiMsg]
      setMessages(finalMessages)
      updateSessionMessages(sessionId, finalMessages)
    } catch (err) {
      const errMsg = {
        id:        newMessageId(),
        role:      'assistant',
        content:   err.message || 'An unexpected error occurred.',
        agent:     null,
        citations: [],
        comparison:null,
        timestamp: new Date().toISOString(),
        error:     true,
      }
      const failedMessages = [...newMessages, errMsg]
      setMessages(failedMessages)
      updateSessionMessages(sessionId, failedMessages)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [activeSessionId, messages, isLoading, selectedDocIds, startNewSession, updateSessionMessages])

  // ── Retry last failed message ─────────────────────────────
  const retryLast = useCallback(() => {
    // Find the last user message
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    // Remove the last (failed) AI message
    const trimmed = messages.filter((m, i) => !(i === messages.length - 1 && m.error))
    setMessages(trimmed)
    sendQuestion(lastUser.content)
  }, [messages, sendQuestion])

  // ── Copy message content ──────────────────────────────────
  const copyMessage = useCallback(async (content) => {
    try {
      await navigator.clipboard.writeText(content)
      return true
    } catch {
      return false
    }
  }, [])

  return {
    sessions,
    activeSessionId,
    activeSession,
    messages,
    isLoading,
    error,
    activeAgent,
    selectedDocIds,
    sourcePanelCitation,
    setSelectedDocIds,
    setSourcePanelCitation,
    sendQuestion,
    startNewSession,
    switchSession,
    removeSession,
    retryLast,
    copyMessage,
    isDemoMode: isDemoMode(),
  }
}
