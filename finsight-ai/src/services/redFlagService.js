const API_BASE_URL = 'http://127.0.0.1:8000'
const FALLBACK_API_BASE_URL = 'http://127.0.0.1:8001'

async function requestWithFallback(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options)
    if (res.ok) return await res.json()
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Request failed with status ${res.status}`)
  } catch (primaryErr) {
    // Attempt fallback port (8001) in case standalone server is active
    try {
      const fb = await fetch(`${FALLBACK_API_BASE_URL}${endpoint}`, options)
      if (fb.ok) return await fb.json()
    } catch {
      // Fallback failed too
    }
    throw primaryErr
  }
}

export async function getSampleCases() {
  return requestWithFallback('/api/red-flags/samples')
}

export async function scanSampleCase(caseId) {
  return requestWithFallback(`/api/red-flags/sample/${encodeURIComponent(caseId)}`)
}

export async function scanDocumentPDF(file, companyName = '') {
  const formData = new FormData()
  formData.append('file', file)
  const query = companyName ? `?company_name=${encodeURIComponent(companyName)}` : ''
  return requestWithFallback(`/api/red-flags/scan-pdf${query}`, {
    method: 'POST',
    body: formData,
  })
}

export async function scanText(text, companyName = 'Company Under Review') {
  return requestWithFallback('/api/red-flags/scan-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, company_name: companyName }),
  })
}

export async function getRedFlagHealth() {
  return requestWithFallback('/api/red-flags/health')
}
