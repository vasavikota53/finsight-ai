// DEMO comparison. PHASE 2: send both files to your comparison API and return the same shape.
const wait = ms => new Promise(r => setTimeout(r, ms))
export async function compareDocuments(a, b, onProgress = () => {}) {
  for (let p = 0; p <= 100; p += 8) { onProgress(Math.min(p, 100)); await wait(250) }
  onProgress(100)
  return {
    simulated: true,
    similarity: 87,
    matches: ['Company name and address', 'Reporting period', 'Document structure and headings'],
    differences: ['Total revenue figure changed', 'Payment terms clause reworded', 'Signature date missing in Document B'],
    rows: [
      { field: 'Company name', a: 'Sample Corp Ltd.', b: 'Sample Corp Ltd.', state: 'same' },
      { field: 'Total revenue', a: '$1,200,000', b: '$1,248,300', state: 'changed' },
      { field: 'Payment terms', a: 'Net 30', b: 'Net 45', state: 'changed' },
      { field: 'Signature date', a: '12 Mar 2026', b: '(missing)', state: 'missing' },
    ],
    summary: `Simulated: "${a.name}" and "${b.name}" are mostly similar, with differences in amounts, terms and one missing field.`,
  }
}
