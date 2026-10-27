import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Eye, X } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { history } from '../data/mockData.js'
export default function AnalysisHistory() {
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || ''), [type, setType] = useState('All'), [sel, setSel] = useState(null)
  const rows = history.filter(r => (type === 'All' || r.type === type) && r.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <div className="head"><div><h1>Analysis History</h1><p className="muted">Previous demo analyses.</p></div></div>
      <div className="row gap wrap">
        <div className="search grow"><Search size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by document name" aria-label="Search history" /></div>
        <select value={type} onChange={e => setType(e.target.value)} aria-label="Filter by type"><option>All</option><option>Verification</option><option>Comparison</option></select>
      </div>
      <div className="card tablewrap">
        {rows.length ? (
          <table><thead><tr><th>Document</th><th>Type</th><th>Date</th><th>Status</th><th><span className="sr">Actions</span></th></tr></thead>
            <tbody>{rows.map(r => <tr key={r.id}><td>{r.name}</td><td>{r.type}</td><td>{r.date}</td><td><StatusBadge status={r.status} /></td>
              <td><button className="btn sm-btn" onClick={() => setSel(r)}><Eye size={14} />View details</button></td></tr>)}</tbody></table>
        ) : <p className="muted center">No analyses match. Clear the search or choose All.</p>}
      </div>
      {sel && (
        <div className="modal-bg" onClick={() => setSel(null)}>
          <div className="card modal" role="dialog" aria-modal="true" aria-label="Analysis details" onClick={e => e.stopPropagation()}>
            <div className="row between"><h3>{sel.name}</h3><button className="icon-btn" onClick={() => setSel(null)} aria-label="Close"><X size={18} /></button></div>
            <p className="muted sm">{sel.type} · {sel.date}</p><StatusBadge status={sel.status} /><p>{sel.note}</p><p className="demo-note sm">Demo record.</p>
          </div>
        </div>
      )}
    </>
  )
}
