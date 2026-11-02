import { Link } from 'react-router-dom'
import { Upload, GitCompare, BarChart3, ScanSearch, Layers, Brain, FileSearch, AlertOctagon } from 'lucide-react'
import { useApp } from '../hooks/useApp.jsx'
import StatCard from '../components/StatCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import BarChart from '../components/BarChart.jsx'
import { stats, activity, history } from '../data/mockData.js'
const caps = [[ScanSearch, 'Field extraction'], [Layers, 'Version comparison'], [Brain, 'Insight agents'], [FileSearch, 'Consistency checks']]
export default function Dashboard() {
  const { user } = useApp()
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const recent = history.slice(0, 5)
  const procs = [['Q3_Financial_Statement.pdf', 100, 'Verified'], ['Budget_Forecast_FY27.pdf', 45, 'Processing'], ['Vendor_Invoice_0912.docx', 100, 'Flagged']]
  return (
    <>
      <div className="head"><div><h1>Welcome back, {user.name}</h1><p className="muted">{today}</p></div>
        <div className="row gap wrap">
          <Link className="btn pri" to="/red-flags"><AlertOctagon size={16} />Red Flag Audit</Link>
          <Link className="btn" to="/verify"><Upload size={16} />Upload Document</Link>
          <Link className="btn" to="/compare"><GitCompare size={16} />Compare Documents</Link>
          <Link className="btn" to="/reports"><BarChart3 size={16} />View Reports</Link>
        </div>
      </div>
      <p className="demo-note sm">All numbers on this page are demonstration data.</p>
      <div className="grid g4">{stats.map(s => <StatCard key={s.label} {...s} />)}</div>
      <div className="grid g2">
        <div className="card"><h3>Document activity over time</h3><BarChart data={activity} title="Documents processed per month (demo)" /></div>
        <div className="card"><h3>Processing status</h3>
          {procs.map(([n, p, s]) => <div key={n} className="proc"><div className="row between"><span className="sm">{n}</span><StatusBadge status={s} /></div><div className="bar-track"><div style={{ width: `${p}%` }} /></div></div>)}
        </div>
      </div>
      <div className="grid g2">
        <div className="card"><h3>Recent activity</h3>
          {recent.map(r => <div key={r.id} className="li"><div><strong className="sm">{r.name}</strong><div className="muted sm">{r.type} · {r.date}</div></div><StatusBadge status={r.status} /></div>)}
          <Link to="/history" className="link">See full history</Link></div>
        <div className="card"><h3>Intended AI capabilities</h3><p className="muted sm">Planned for later phases. Not active in this demo.</p>
          <div className="grid g2 tight">{caps.map(([Ic, t]) => <div key={t} className="cap"><span className="ico v"><Ic size={18} /></span>{t}</div>)}</div></div>
      </div>
    </>
  )
}
