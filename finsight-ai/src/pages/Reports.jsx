import { useState } from 'react'
import { Download } from 'lucide-react'
import BarChart from '../components/BarChart.jsx'
import { reports, insights, activity } from '../data/mockData.js'
import { useApp } from '../hooks/useApp.jsx'
export default function Reports() {
  const { toast } = useApp(), [sel, setSel] = useState(reports[0])
  const download = () => {
    const text = `FINSIGHT AI - DEMO REPORT\n${sel.title}\n\n${sel.desc}\n\n${sel.kpis.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nAll figures are demonstration data.\n`
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `${sel.title.replace(/\s+/g, '_')}_demo.txt` })
    a.click(); URL.revokeObjectURL(url); toast('Demo report downloaded.', 'success')
  }
  return (
    <>
      <div className="head"><div><h1>Reports & Insights</h1><p className="muted">Sample reports and insights. All data is demo data.</p></div></div>
      <div className="grid g3">{reports.map(r => (
        <button key={r.id} className={`card report ${sel.id === r.id ? 'sel' : ''}`} onClick={() => setSel(r)}><h3>{r.title}</h3><p className="muted sm">{r.desc}</p></button>))}
      </div>
      <div className="grid g2">
        <div className="card"><div className="row between"><h3>Preview: {sel.title}</h3><button className="btn pri" onClick={download}><Download size={16} />Download</button></div>
          <div className="grid g3 tight">{sel.kpis.map(([k, v]) => <div key={k} className="kpi"><div className="muted sm">{k}</div><div className="big">{v}</div></div>)}</div></div>
        <div className="card"><h3>Documents per month (demo)</h3><BarChart data={activity} title="Documents per month (demo)" /></div>
      </div>
      <div className="card"><h3>Sample insights</h3><ul>{insights.map(i => <li key={i} className="sm">{i}</li>)}</ul></div>
    </>
  )
}
