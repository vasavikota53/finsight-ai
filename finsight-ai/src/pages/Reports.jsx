// import { useState } from 'react'
// import { Download } from 'lucide-react'
// import BarChart from '../components/BarChart.jsx'
// import { reports, insights, activity } from '../data/mockData.js'
// import { useApp } from '../hooks/useApp.jsx'
// export default function Reports() {
//   const { toast } = useApp(), [sel, setSel] = useState(reports[0])
//   const download = () => {
//     const text = `FINSIGHT AI - DEMO REPORT\n${sel.title}\n\n${sel.desc}\n\n${sel.kpis.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nAll figures are demonstration data.\n`
//     const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
//     const a = Object.assign(document.createElement('a'), { href: url, download: `${sel.title.replace(/\s+/g, '_')}_demo.txt` })
//     a.click(); URL.revokeObjectURL(url); toast('Demo report downloaded.', 'success')
//   }
//   return (
//     <>
//       <div className="head"><div><h1>Reports & Insights</h1><p className="muted">Sample reports and insights. All data is demo data.</p></div></div>
//       <div className="grid g3">{reports.map(r => (
//         <button key={r.id} className={`card report ${sel.id === r.id ? 'sel' : ''}`} onClick={() => setSel(r)}><h3>{r.title}</h3><p className="muted sm">{r.desc}</p></button>))}
//       </div>
//       <div className="grid g2">
//         <div className="card"><div className="row between"><h3>Preview: {sel.title}</h3><button className="btn pri" onClick={download}><Download size={16} />Download</button></div>
//           <div className="grid g3 tight">{sel.kpis.map(([k, v]) => <div key={k} className="kpi"><div className="muted sm">{k}</div><div className="big">{v}</div></div>)}</div></div>
//         <div className="card"><h3>Documents per month (demo)</h3><BarChart data={activity} title="Documents per month (demo)" /></div>
//       </div>
//       <div className="card"><h3>Sample insights</h3><ul>{insights.map(i => <li key={i} className="sm">{i}</li>)}</ul></div>
//     </>
//   )
// }


import { useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { useApp } from '../hooks/useApp.jsx'
import { generateFinancialReport } from '../services/reportService.js'

export default function Reports() {
  const { toast } = useApp()

  const [file, setFile] = useState(null)
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!file) {
      toast('Please select a financial PDF first.', 'error')
      return
    }

    setLoading(true)

    try {
      const pdfBlob = await generateFinancialReport(
        file,
        companyName
      )

      const downloadUrl = URL.createObjectURL(pdfBlob)

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${file.name.replace(/\.pdf$/i, '')}_financial_report.pdf`

      document.body.appendChild(link)
      link.click()
      link.remove()

      URL.revokeObjectURL(downloadUrl)

      toast('Financial report generated successfully!', 'success')
    } catch (error) {
      toast(error.message || 'Unable to generate report.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="head">
        <div>
          <h1>Reports & Insights</h1>
          <p className="muted">
            Generate an analyst-style financial research report
            from your uploaded PDF.
          </p>
        </div>
      </div>

      <div className="card">
        <h3>
          <FileText size={20} /> Generate Financial Report
        </h3>

        <div style={{ marginTop: '20px' }}>
          <label>Company Name</label>

          <input
            type="text"
            placeholder="Enter company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              marginBottom: '20px',
            }}
          />

          <label>Upload Financial PDF</label>

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files[0] || null)}
            style={{
              display: 'block',
              marginTop: '10px',
              marginBottom: '20px',
            }}
          />

          {file && (
            <p className="muted sm">
              Selected file: {file.name}
            </p>
          )}

          <button
            className="btn pri"
            onClick={handleGenerate}
            disabled={loading}
          >
            <Download size={16} />
            {loading ? 'Generating Report...' : 'Generate & Download PDF'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Report Sections</h3>
        <ul>
          <li>Executive Summary</li>
          <li>Key Financial Ratios</li>
          <li>Red Flag Analysis</li>
          <li>Company Comparison — pending Comparison Agent integration</li>
          <li>Outlook based on available agent findings</li>
        </ul>
      </div>
    </>
  )
}
