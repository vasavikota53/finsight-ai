// DEMO DATA ONLY - none of this is real analytics.
export const stats = [
  { label: 'Total Documents', value: 248, trend: '+12%', icon: 'files', color: 'c' },
  { label: 'Documents Verified', value: 196, trend: '+8%', icon: 'check', color: 'ok' },
  { label: 'Documents Pending', value: 21, trend: '-3%', icon: 'clock', color: 'wn' },
  { label: 'Documents Compared', value: 64, trend: '+15%', icon: 'compare', color: 'v' },
]
export const activity = [
  { label: 'Jan', value: 18 }, { label: 'Feb', value: 26 }, { label: 'Mar', value: 22 }, { label: 'Apr', value: 35 },
  { label: 'May', value: 41 }, { label: 'Jun', value: 38 }, { label: 'Jul', value: 52 },
]
export const history = [
  { id: 1, name: 'Q3_Financial_Statement.pdf', type: 'Verification', date: '2026-10-14', status: 'Verified', note: 'All sample fields present.' },
  { id: 2, name: 'Annual_Report_2025 vs 2024.pdf', type: 'Comparison', date: '2026-10-12', status: 'Completed', note: '87% similarity (demo).' },
  { id: 3, name: 'Vendor_Invoice_0912.docx', type: 'Verification', date: '2026-10-10', status: 'Flagged', note: 'Total does not match line items (demo).' },
  { id: 4, name: 'Loan_Agreement_v2 vs v3.docx', type: 'Comparison', date: '2026-10-08', status: 'Completed', note: '5 changed clauses (demo).' },
  { id: 5, name: 'Board_Minutes_Sept.txt', type: 'Verification', date: '2026-10-05', status: 'Verified', note: 'No issues in demo run.' },
  { id: 6, name: 'Budget_Forecast_FY27.pdf', type: 'Verification', date: '2026-10-02', status: 'Pending', note: 'Queued (demo).' },
  { id: 7, name: 'Contract_Draft vs Final.pdf', type: 'Comparison', date: '2026-09-28', status: 'Completed', note: '92% similarity (demo).' },
  { id: 8, name: 'Tax_Summary_2025.pdf', type: 'Verification', date: '2026-09-25', status: 'Flagged', note: 'Missing signature date (demo).' },
]
export const reports = [
  { id: 1, title: 'Quarterly Risk Overview', desc: 'Demo summary of verification outcomes this quarter.', kpis: [['Verified rate', '79%'], ['Flagged', '11'], ['Avg. time', '42s']] },
  { id: 2, title: 'Document Change Digest', desc: 'Demo digest of the most common changes between versions.', kpis: [['Comparisons', '64'], ['Avg. similarity', '88%'], ['Changed fields', '37']] },
  { id: 3, title: 'Business Insight Snapshot', desc: 'Demo highlights an AI agent could surface from uploaded reports.', kpis: [['Revenue trend', '+6.4%'], ['Cost ratio', '61%'], ['Risk items', '4']] },
]
export const insights = [
  'Revenue language is consistent across the last three sample reports.',
  'Two vendor invoices show totals that differ from their line items.',
  'Contract revisions most often change payment terms and dates.',
]
export const faqs = [
  ['Is this real AI verification?', 'No. Phase 1 is frontend only. Every result is simulated demo data.'],
  ['Which files can I upload?', 'PDF, DOC, DOCX and TXT files up to 10 MB.'],
  ['Are my files uploaded anywhere?', 'No. Files stay in your browser and are never sent to a server.'],
  ['How will the AI be added later?', 'Replace the functions in src/services with real API calls to the agent backend.'],
]
