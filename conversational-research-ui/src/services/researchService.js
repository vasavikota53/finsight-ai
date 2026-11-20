
/**
 * researchService.js
 *
 * FinSight AI Conversational Research Interface
 *
 * Live chat:
 * React -> FastAPI -> PDF search results -> React
 *
 * Sessions and documents remain in demo mode
 * until their backend endpoints are available.
 */

import apiClient, { ENDPOINTS } from './api.js'

import {
  DEMO_RESPONSES,
  DEMO_SESSIONS,
  DEMO_DOCUMENTS,
} from '../data/demoData.js'

// ============================================================
// MODE CONFIGURATION
// ============================================================

// Controls sessions and documents.
// Keep these in demo mode while their APIs are unfinished.
export const isDemoMode = () =>
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  import.meta.env.MODE === 'demo' ||
  !import.meta.env.VITE_API_BASE_URL

// Controls chat independently.
export const isLiveChatMode = () =>
  import.meta.env.VITE_LIVE_CHAT === 'true' &&
  Boolean(import.meta.env.VITE_API_BASE_URL)

// Simulate loading time for demo responses.
const demoDelay = (ms = 1200) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// ============================================================
// TYPES
// ============================================================

/**
 * @typedef {Object} Citation
 * @property {string} document_id
 * @property {string} document_name
 * @property {string} company
 * @property {number|null} page
 * @property {string} excerpt
 * @property {string|null} file_url
 * @property {string} [chunk_id]
 */

/**
 * @typedef {Object} ComparisonRow
 * @property {string} company
 * @property {string} financial_year
 * @property {string|null} revenue
 * @property {string|null} net_profit
 * @property {string|null} operating_margin
 * @property {string|null} debt
 * @property {string} currency
 * @property {string} unit
 * @property {Citation[]} citations
 */

/**
 * @typedef {Object} QueryResponse
 * @property {string} answer
 * @property {string} agent
 * @property {Citation[]} citations
 * @property {ComparisonRow[]|null} comparison
 */

// ============================================================
// RESEARCH QUERY
// ============================================================

/**
 * Sends a financial question to the backend.
 *
 * Current backend endpoint:
 * POST /api/search
 *
 * Request:
 * {
 *   question: string,
 *   company: "Apple" | "Amazon" | null
 * }
 *
 * Current response:
 * {
 *   question: string,
 *   company: string,
 *   count: number,
 *   results: [
 *     {
 *       source: string,
 *       chunk_id: string,
 *       score: number,
 *       text: string
 *     }
 *   ]
 * }
 *
 * @param {string} sessionId
 * @param {string} question
 * @param {string[]} documentIds
 * @returns {Promise<QueryResponse>}
 */

export async function postQuery(
  sessionId,
  question,
  documentIds = []
) {
  // Use demo responses unless live chat is enabled.
  if (!isLiveChatMode()) {
    await demoDelay(1400 + Math.random() * 800)
    return getDemoResponse(question)
  }

  const cleanQuestion = question.trim()

  if (!cleanQuestion) {
    throw new Error('Please enter a research question.')
  }

  // The current backend does not yet support
  // session_id or document_ids filtering.
  // Keep those arguments for future integration.

  try {
    const { data } = await apiClient.post(
      ENDPOINTS.QUERY,
      {
        question: cleanQuestion,
        company: null,
      }
    )

    // If the Research Agent later returns
    // an AI-generated answer, use it directly.
    if (typeof data.answer === 'string') {
      return normalizeQueryResponse(data)
    }

    // Current backend returns matching PDF chunks.
    const results = Array.isArray(data.results)
      ? data.results
      : []

    if (results.length === 0) {
      return {
        answer:
          'No relevant information was found in the indexed financial documents.',
        agent: 'research',
        citations: [],
        comparison: null,
      }
    }

    // Build a readable response using retrieved text.
    // This is evidence retrieval, not AI synthesis.
    const answer = [
      'Relevant information retrieved from the financial PDFs:',
      ...results.map((result, index) => {
        const source =
          result.source || 'Unknown document'

        const text =
          result.text || 'No text available.'

        return (
          `[${index + 1}] Source: ${source}\n\n` +
          text
        )
      }),
    ].join('\n\n')

    // Convert search results to UI citations.
    // Do not invent missing page numbers.
    const citations = results.map((result) => ({
      document_id: result.source || '',
      document_name:
        result.source || 'Unknown document',
      company: '',
      page: null,
      excerpt: result.text || '',
      file_url: null,
      chunk_id: result.chunk_id || '',
    }))

    return {
      answer,
      agent: 'research',
      citations,
      comparison: null,
    }
  } catch (error) {
    console.error('FinSight research query failed:', error)

    const message =
      error.response?.data?.detail ||
      error.message ||
      'Unknown API error'

    throw new Error(
      `Unable to retrieve financial research results: ${message}`
    )
  }
}

// ============================================================
// RESPONSE NORMALIZATION
// ============================================================

/**
 * Supports future Research Agent responses that already
 * contain generated answers and citation metadata.
 */

function normalizeQueryResponse(data) {
  return {
    answer:
      data.answer ?? 'No answer returned.',

    agent:
      data.agent ?? 'research',

    citations:
      Array.isArray(data.citations)
        ? data.citations
        : [],

    comparison:
      data.comparison ?? null,
  }
}

// ============================================================
// RESEARCH SESSIONS
// ============================================================

export async function getSessions() {
  if (isDemoMode()) {
    await demoDelay(300)
    return DEMO_SESSIONS
  }

  const { data } = await apiClient.get(
    ENDPOINTS.SESSIONS
  )

  return Array.isArray(data)
    ? data
    : data.sessions ?? []
}

export async function createSession(
  name = 'New Research'
) {
  if (isDemoMode()) {
    await demoDelay(200)

    return {
      id: `demo-session-${Date.now()}`,
      name,
      created_at: new Date().toISOString(),
      messages: [],
    }
  }

  const { data } = await apiClient.post(
    ENDPOINTS.SESSIONS,
    { name }
  )

  return data
}

export async function deleteSession(sessionId) {
  if (isDemoMode()) {
    await demoDelay(200)
    return { success: true }
  }

  const { data } = await apiClient.delete(
    ENDPOINTS.SESSION(sessionId)
  )

  return data
}

// ============================================================
// DOCUMENTS
// ============================================================

export async function getDocuments() {
  if (isDemoMode()) {
    await demoDelay(400)
    return DEMO_DOCUMENTS
  }

  const { data } = await apiClient.get(
    ENDPOINTS.DOCUMENTS
  )

  return Array.isArray(data)
    ? data
    : data.documents ?? []
}

// ============================================================
// DOCUMENT UPLOAD
// ============================================================

export async function uploadDocument(
  file,
  onProgress
) {
  if (isDemoMode()) {
    await demoDelay(1500)

    return {
      id: `demo-doc-${Date.now()}`,
      name: file.name,
      status: 'indexed',
      company: 'Demo Company',
      pages: 42,
      uploaded_at: new Date().toISOString(),
    }
  }

  const form = new FormData()
  form.append('file', file)

  const { data } = await apiClient.post(
    ENDPOINTS.DOCUMENT_UPLOAD,
    form,
    {
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          const percentage = Math.round(
            (event.loaded * 100) / event.total
          )

          onProgress(percentage)
        }
      },
    }
  )

  return data
}

// ============================================================
// DEMO RESPONSE LOGIC
// ============================================================

function getDemoResponse(question) {
  const q = question.toLowerCase()

  if (
    q.includes('compar') ||
    q.includes('vs') ||
    q.includes('versus')
  ) {
    return DEMO_RESPONSES.comparison
  }

  if (
    q.includes('risk') ||
    q.includes('threat') ||
    q.includes('concern')
  ) {
    return DEMO_RESPONSES.risks
  }

  if (
    q.includes('debt') ||
    q.includes('liab')
  ) {
    return DEMO_RESPONSES.debt
  }

  if (
    q.includes('summarize') ||
    q.includes('summary') ||
    q.includes('overview')
  ) {
    return DEMO_RESPONSES.summary
  }

  if (
    q.includes('revenue') ||
    q.includes('growth') ||
    q.includes('sales')
  ) {
    return DEMO_RESPONSES.revenue
  }

  if (
    q.includes('margin') ||
    q.includes('profit') ||
    q.includes('ebitda')
  ) {
    return DEMO_RESPONSES.margin
  }

  return DEMO_RESPONSES.generic
}
