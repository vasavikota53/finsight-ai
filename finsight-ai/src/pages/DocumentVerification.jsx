import { useState } from 'react'
import { ShieldCheck, RotateCcw, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import FileUpload from '../components/FileUpload.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { verifyDocument } from '../services/verificationService.js'
import { useApp } from '../hooks/useApp.jsx'
export default function DocumentVerification() {
  const { toast } = useApp()
  const [file, setFile] = useState(null), [busy, setBusy] = useState(false), [pct, setPct] = useState(0), [res, setRes] = useState(null)
  const run = async () => {
    setBusy(true); setRes(null); setPct(0)
    try { setRes(await verifyDocument(file, setPct)); toast('Demo verification finished.', 'success') }
    catch { toast('Demo verification failed. Try again.', 'error') }
    setBusy(false)
  }
  const reset = () => { setFile(null); setRes(null); setPct(0) }
  return (
    <>
      <div className="head"><div><h1>Document Verification</h1><p className="muted">Upload one document to run a demo verification.</p></div></div>
      <p className="demo-note sm">DEMO: results are simulated. No AI or database check is performed and your file never leaves this browser.</p>
      <FileUpload id="verify-file" label="Document" file={file} onFile={f => { setFile(f); setRes(null) }} onError={m => toast(m, 'error')} />
      {busy && <div className="card"><div className="row between sm"><span><Loader2 className="spin" size={14} /> Running demo verification</span><span>{pct}%</span></div><div className="bar-track"><div style={{ width: `${pct}%` }} /></div></div>}
      <div className="row gap">
        <button className="btn pri" disabled={!file || busy} onClick={run}><ShieldCheck size={16} />Verify Document</button>
        {(file || res) && <button className="btn" onClick={reset} disabled={busy}><RotateCcw size={16} />Reset</button>}
      </div>
      {res && (
        <div className="card fade"><div className="row between"><h3>Results <span className="badge wn">SIMULATED</span></h3><StatusBadge status={res.status} /></div>
          <p>{res.summary}</p>
          <h4>Key information (sample)</h4>
          <dl className="kv">{res.fields.map(([k, v]) => <div key={k}><dt className="muted sm">{k}</dt><dd>{v}</dd></div>)}</dl>
          <h4>Observations (sample)</h4>
          {res.issues.map((i, n) => <div key={n} className="li">{i.level === 'ok' ? <CheckCircle2 size={18} className="okc" /> : <AlertTriangle size={18} className="wnc" />}<span className="grow sm">{i.text}</span></div>)}
        </div>
      )}
    </>
  )
}
