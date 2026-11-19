/**
 * researchService.js
 * Adapter layer between UI components and backend API.
 *
 * When your teammates finalize the backend contract, update ONLY this
 * file — no component changes required.
 */

import apiClient, { ENDPOINTS } from './api.js'
import { DEMO_RESPONSES, DEMO_SESSIONS, DEMO_DOCUMENTS } from '../data/demoData.js'

// ─── Mode Detection ───────────────────────────────────────────
export const isDemoMode = () =>
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  import.meta.env.MODE === 'demo' ||
  !import.meta.env.VITE_API_BASE_URL

// ─── Helper: simulate async latency in demo mode ─────────────
const demoDelay = (ms = 1200) => new Promise((r) => setTimeout(r, ms))

// ─── Types (JSDoc) ───────────────────────────────────────────
/**
 * @typedef {Object} Citation
 * @property {string}  document_id
 * @property {string}  document_name
 * @property {string}  company
 * @property {number}  page
 * @property {string}  excerpt
 * @property {string|null} file_url
 */

/**
 * @typedef {Object} ComparisonRow
 * @property {string} company
 * @property {string} financial_year
 * @property {string|null} revenue
 * @property {string|null} net_profit
 * @property {string|null} operating_margin
 * @property {string|null} debt
 * @property {string}  currency
 * @property {string}  unit
 * @property {Citation[]} citations
 */

/**
 * @typedef {Object} QueryResponse
 * @property {string}         answer
 * @property {string}         agent
 * @property {Citation[]}     citations
 * @property {ComparisonRow[]|null} comparison
 */

// ─────────────────────────────────────────────────────────────
//  Research Queries
// ─────────────────────────────────────────────────────────────

/**
 * Post a research question to the backend (or demo).
 * @param {string}   sessionId
 * @param {string}   question
 * @param {string[]} documentIds
 * @returns {Promise<QueryResponse>}
 */
export async function postQuery(sessionId, question, documentIds = []) {
  if (isDemoMode()) {
    await demoDelay(1400 + Math.random() * 800)
    return getDemoResponse(question)
  }

  const { data } = await apiClient.post(ENDPOINTS.QUERY, {
    session_id:   sessionId,
    question,
    document_ids: documentIds,
  })

  return normalizeQueryResponse(data)
}

/** Normalize / validate the backend response shape */
function normalizeQueryResponse(data) {
  return {
    answer:     data.answer     ?? 'No answer returned.',
    agent:      data.agent      ?? 'research',
    citations:  Array.isArray(data.citations) ? data.citations : [],
    comparison: data.comparison ?? null,
  }
}

// ─────────────────────────────────────────────────────────────
//  Sessions
// ─────────────────────────────────────────────────────────────

export async function getSessions() {
  if (isDemoMode()) {
    await demoDelay(300)
    return DEMO_SESSIONS
  }
  const { data } = await apiClient.get(ENDPOINTS.SESSIONS)
  return Array.isArray(data) ? data : data.sessions ?? []
}

export async function createSession(name = 'New Research') {
  if (isDemoMode()) {
    await demoDelay(200)
    return {
      id:         `demo-session-${Date.now()}`,
      name,
      created_at: new Date().toISOString(),
      messages:   [],
    }
  }
  const { data } = await apiClient.post(ENDPOINTS.SESSIONS, { name })
  return data
}

export async function deleteSession(sessionId) {
  if (isDemoMode()) {
    await demoDelay(200)
    return { success: true }
  }
  const { data } = await apiClient.delete(ENDPOINTS.SESSION(sessionId))
  return data
}

// ─────────────────────────────────────────────────────────────
//  Documents
// ─────────────────────────────────────────────────────────────

export async function getDocuments() {
  if (isDemoMode()) {
    await demoDelay(400)
    return DEMO_DOCUMENTS
  }
  const { data } = await apiClient.get(ENDPOINTS.DOCUMENTS)
  return Array.isArray(data) ? data : data.documents ?? []
}

export async function uploadDocument(file, onProgress) {
  if (isDemoMode()) {
    await demoDelay(1500)
    return {
      id:     `demo-doc-${Date.now()}`,
      name:   file.name,
      status: 'indexed',
      company: 'Demo Company',
      pages:  42,
      uploaded_at: new Date().toISOString(),
    }
  }
  const form = new FormData()
  form.append('file', file)
  const { data } = await apiClient.post(ENDPOINTS.DOCUMENT_UPLOAD, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
    },
  })
  return data
}

// ─────────────────────────────────────────────────────────────
//  Demo Response Logic
// ─────────────────────────────────────────────────────────────

function getDemoResponse(question) {
  const q = question.toLowerCase()

  // Pick contextual demo response
  if (q.includes('compar') || q.includes('vs') || q.includes('versus'))
    return DEMO_RESPONSES.comparison
  if (q.includes('risk') || q.includes('threat') || q.includes('concern'))
    return DEMO_RESPONSES.risks
  if (q.includes('debt') || q.includes('liab'))
    return DEMO_RESPONSES.debt
  if (q.includes('summarize') || q.includes('summary') || q.includes('overview'))
    return DEMO_RESPONSES.summary
  if (q.includes('revenue') || q.includes('growth') || q.includes('sales'))
    return DEMO_RESPONSES.revenue
  if (q.includes('margin') || q.includes('profit') || q.includes('ebitda'))
    return DEMO_RESPONSES.margin

  return DEMO_RESPONSES.generic
}
