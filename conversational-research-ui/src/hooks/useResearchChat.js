
/**
 * useResearchChat.js
 * Core hook managing chat state, session persistence, and API calls.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  postQuery,
  getSessions,
  createSession,
  deleteSession,
  isDemoMode,
} from '../services/researchService.js'

const STORAGE_KEY = 'finresearch_sessions'

// ─── Helpers ─────────────────────────────────────────────────

function newMessageId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function newSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// Always store a valid string as the session name.
// This prevents React click events or objects from becoming
// "[object Object]" in the sidebar.
function normalizeSessionName(value) {
  if (typeof value === 'string') {
    const name = value.trim()

    if (name && name !== '[object Object]') {
      return name
    }
  }

  return 'New Research'
}

function normalizeSession(session) {
  if (!session || typeof session !== 'object') {
    return null
  }

  if (!session.id) {
    return null
  }

  return {
    ...session,
    name: normalizeSessionName(session.name),
    messages: Array.isArray(session.messages)
      ? session.messages
      : [],
    preview:
      typeof session.preview === 'string'
        ? session.preview
        : '',
  }
}

function loadPersistedSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map(normalizeSession)
      .filter(Boolean)
  } catch {
    return []
  }
}

function persistSessions(sessions) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sessions)
    )
  } catch {
    // Storage unavailable or quota exceeded.
  }
}

// ─── Main Hook ───────────────────────────────────────────────

export function useResearchChat() {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [selectedDocIds, setSelectedDocIds] = useState([])
  const [activeAgent, setActiveAgent] = useState(null)

  const [
    sourcePanelCitation,
    setSourcePanelCitation,
  ] = useState(null)

  const abortRef = useRef(null)

  // Prevent outdated responses from overwriting
  // a different session's visible messages.
  const activeSessionIdRef = useRef(null)

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId
  }, [activeSessionId])

  // ─── Load sessions on mount ──────────────────────────────

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (isDemoMode()) {
        const persisted = loadPersistedSessions()

        if (cancelled) return

        setSessions(persisted)

        if (persisted.length > 0) {
          setActiveSessionId(persisted[0].id)
          activeSessionIdRef.current = persisted[0].id
          setMessages(persisted[0].messages)
        }

        return
      }

      try {
        const serverSessions = await getSessions()

        if (cancelled) return

        const normalized = Array.isArray(serverSessions)
          ? serverSessions
              .map(normalizeSession)
              .filter(Boolean)
          : []

        setSessions(normalized)

        if (normalized.length > 0) {
          setActiveSessionId(normalized[0].id)
          activeSessionIdRef.current = normalized[0].id
          setMessages(normalized[0].messages)
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            'Failed to load research sessions:',
            err
          )
        }
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [])

  // ─── Persist sessions locally ────────────────────────────

  useEffect(() => {
    if (isDemoMode() && sessions.length > 0) {
      persistSessions(sessions)
    }
  }, [sessions])

  // ─── Active session ──────────────────────────────────────

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ?? null

  // ─── Start new research session ──────────────────────────

  const startNewSession = useCallback(
    async (requestedName = 'New Research') => {
      const name = normalizeSessionName(requestedName)

      try {
        let session

        if (isDemoMode()) {
          session = {
            id: newSessionId(),
            name,
            created_at: new Date().toISOString(),
            preview: '',
            messages: [],
          }
        } else {
          const response = await createSession(name)

          session = normalizeSession({
            ...response,
            name: response?.name ?? name,
            messages: [],
          })

          if (!session) {
            throw new Error(
              'The server returned an invalid session.'
            )
          }
        }

        activeSessionIdRef.current = session.id

        setSessions((prev) => [session, ...prev])
        setActiveSessionId(session.id)
        setMessages([])
        setError(null)
        setActiveAgent(null)
        setSourcePanelCitation(null)

        return session
      } catch (err) {
        setError(
          err.message || 'Unable to create research session.'
        )

        return null
      }
    },
    []
  )

  // ─── Switch session ──────────────────────────────────────

  const switchSession = useCallback(
    (sessionId) => {
      const session = sessions.find(
        (s) => s.id === sessionId
      )

      if (!session) return

      activeSessionIdRef.current = sessionId

      setActiveSessionId(sessionId)
      setMessages(session.messages || [])
      setError(null)
      setActiveAgent(null)
      setSourcePanelCitation(null)
    },
    [sessions]
  )

  // ─── Remove session ──────────────────────────────────────

  const removeSession = useCallback(
    async (sessionId) => {
      if (!isDemoMode()) {
        try {
          await deleteSession(sessionId)
        } catch (err) {
          setError(
            err.message || 'Unable to delete session.'
          )
          return
        }
      }

      const remaining = sessions.filter(
        (s) => s.id !== sessionId
      )

      setSessions(remaining)

      if (activeSessionIdRef.current === sessionId) {
        const nextSession = remaining[0] || null

        activeSessionIdRef.current =
          nextSession?.id ?? null

        setActiveSessionId(nextSession?.id ?? null)
        setMessages(nextSession?.messages || [])
        setActiveAgent(null)
        setSourcePanelCitation(null)
      }

      // Remove the deleted session from persisted storage,
      // including when it was the final remaining session.
      if (isDemoMode()) {
        persistSessions(remaining)
      }
    },
    [sessions]
  )

  // ─── Update session messages ─────────────────────────────

  const updateSessionMessages = useCallback(
    (sessionId, msgs) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) {
            return session
          }

          const firstUserMessage = msgs.find(
            (msg) => msg.role === 'user'
          )

          const preview =
            typeof firstUserMessage?.content === 'string'
              ? firstUserMessage.content.slice(0, 80)
              : session.preview

          return {
            ...session,
            messages: msgs,
            preview,
          }
        })
      )
    },
    []
  )

  // ─── Send research question ──────────────────────────────

  const sendQuestion = useCallback(
    async (question) => {
      if (
        typeof question !== 'string' ||
        !question.trim() ||
        isLoading
      ) {
        return
      }

      const cleanQuestion = question.trim()

      let sessionId = activeSessionIdRef.current
      let currentMessages = messages

      // Automatically create a session when the user
      // sends a question without selecting one.
      if (!sessionId) {
        const session = await startNewSession(
          cleanQuestion.slice(0, 60)
        )

        if (!session) return

        sessionId = session.id
        currentMessages = []
      }

      setError(null)
      setActiveAgent(null)

      const userMsg = {
        id: newMessageId(),
        role: 'user',
        content: cleanQuestion,
        timestamp: new Date().toISOString(),
      }

      const newMessages = [
        ...currentMessages,
        userMsg,
      ]

      if (activeSessionIdRef.current === sessionId) {
        setMessages(newMessages)
      }

      updateSessionMessages(sessionId, newMessages)
      setIsLoading(true)

      try {
        // postQuery handles both:
        // 1. Live backend responses when VITE_LIVE_CHAT=true
        // 2. Demo responses when live chat is disabled.
        const response = await postQuery(
          sessionId,
          cleanQuestion,
          selectedDocIds
        )

        const aiMsg = {
          id: newMessageId(),
          role: 'assistant',
          content:
            typeof response.answer === 'string'
              ? response.answer
              : 'No answer was returned.',
          agent: response.agent ?? 'research',
          citations: Array.isArray(response.citations)
            ? response.citations
            : [],
          comparison: response.comparison ?? null,
          timestamp: new Date().toISOString(),
          error: false,
        }

        const finalMessages = [
          ...newMessages,
          aiMsg,
        ]

        updateSessionMessages(sessionId, finalMessages)

        // Only update the visible chat if the user
        // is still viewing the same session.
        if (activeSessionIdRef.current === sessionId) {
          setMessages(finalMessages)
          setActiveAgent(aiMsg.agent)
        }
      } catch (err) {
        const errorMessage =
          err.message || 'An unexpected error occurred.'

        const errMsg = {
          id: newMessageId(),
          role: 'assistant',
          content: errorMessage,
          agent: null,
          citations: [],
          comparison: null,
          timestamp: new Date().toISOString(),
          error: true,
        }

        const failedMessages = [
          ...newMessages,
          errMsg,
        ]

        updateSessionMessages(sessionId, failedMessages)

        if (activeSessionIdRef.current === sessionId) {
          setMessages(failedMessages)
          setError(errorMessage)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [
      messages,
      isLoading,
      selectedDocIds,
      startNewSession,
      updateSessionMessages,
    ]
  )

  // ─── Retry last failed question ─────────────────────────

  const retryLast = useCallback(() => {
    const lastUser = [...messages]
      .reverse()
      .find((msg) => msg.role === 'user')

    if (!lastUser) return

    const trimmed = messages.filter(
      (msg, index) =>
        !(
          index === messages.length - 1 &&
          msg.error
        )
    )

    setMessages(trimmed)

    if (activeSessionIdRef.current) {
      updateSessionMessages(
        activeSessionIdRef.current,
        trimmed
      )
    }

    sendQuestion(lastUser.content)
  }, [
    messages,
    sendQuestion,
    updateSessionMessages,
  ])

  // ─── Copy message content ───────────────────────────────

  const copyMessage = useCallback(async (content) => {
    try {
      await navigator.clipboard.writeText(
        String(content ?? '')
      )
      return true
    } catch {
      return false
    }
  }, [])

  // ─── Public hook interface ───────────────────────────────

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
