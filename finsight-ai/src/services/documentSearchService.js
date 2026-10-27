
const API_BASE_URL = 'http://127.0.0.1:8000'

export async function searchDocuments(question, company) {
  const response = await fetch(`${API_BASE_URL}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: question.trim(),
      company: company === 'all' ? null : company,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || 'Document search failed.')
  }

  return data
}

