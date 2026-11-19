/**
 * api.js
 * Centralized Axios instance for FinResearch AI.
 *
 * All endpoints are defined here as constants so your teammates
 * can update the backend contract in one place.
 */

import axios from 'axios'

// ─── Configuration ───────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const TIMEOUT  = Number(import.meta.env.VITE_API_TIMEOUT || 30000)

// ─── Axios Instance ──────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
})

// ─── Request Interceptor ─────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Attach auth token when available (future: JWT from auth store)
    const token = typeof window !== 'undefined' && window.__AUTH_TOKEN__
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'))
    }
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'))
    }
    const status  = error.response?.status
    const message = error.response?.data?.detail ||
                    error.response?.data?.message ||
                    error.message
    return Promise.reject(new Error(`[${status}] ${message}`))
  }
)

// ─── API Endpoint Constants ───────────────────────────────────
export const ENDPOINTS = {
  // Research
  QUERY:    '/api/research/query',
  SESSIONS: '/api/research/sessions',
  SESSION:  (id) => `/api/research/sessions/${id}`,

  // Documents
  DOCUMENTS:       '/api/documents',
  DOCUMENT_UPLOAD: '/api/documents/upload',
  DOCUMENT:        (id) => `/api/documents/${id}`,
}

export default apiClient
