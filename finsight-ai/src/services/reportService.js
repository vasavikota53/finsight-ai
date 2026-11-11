
const API_BASE_URL = 'http://127.0.0.1:8000'

export async function generateFinancialReport(file, companyName) {
  const formData = new FormData()
  formData.append('file', file)

  const query = companyName
    ? `?company_name=${encodeURIComponent(companyName)}`
    : ''

  const response = await fetch(
    `${API_BASE_URL}/api/reports/generate${query}`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.detail || 'Report generation failed.'
    )
  }

  return await response.blob()
}
