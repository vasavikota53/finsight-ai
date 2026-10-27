// DEMO verification. PHASE 2: replace the body with a real call, e.g.
//   const form = new FormData(); form.append('file', file)
//   return (await fetch('/api/verify', { method: 'POST', body: form })).json()
const wait = ms => new Promise(r => setTimeout(r, ms))
export async function verifyDocument(file, onProgress = () => {}) {
  for (let p = 0; p <= 100; p += 10) { onProgress(p); await wait(250) }
  return {
    simulated: true,
    status: 'Needs review',
    summary: `Simulated summary for "${file.name}". A real agent would describe the document's purpose and main figures here.`,
    fields: [['Document title', file.name], ['Issuer', 'Sample Corp Ltd. (demo)'], ['Period', 'FY 2025-26 (demo)'], ['Total amount', '$1,248,300 (demo)']],
    issues: [
      { level: 'warn', text: 'Signature date field appears to be missing (simulated).' },
      { level: 'warn', text: 'Subtotal and total may not match (simulated).' },
      { level: 'ok', text: 'Document structure looks complete (simulated).' },
    ],
  }
}
