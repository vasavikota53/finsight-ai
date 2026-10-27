import { useState } from 'react'
import { ShieldCheck, GitCompare } from 'lucide-react'
import { faqs } from '../data/mockData.js'
import { useApp } from '../hooks/useApp.jsx'
export default function HelpSupport() {
  const { toast } = useApp(), [f, setF] = useState({ name: '', email: '', msg: '' }), [err, setErr] = useState({})
  const send = e => {
    e.preventDefault()
    const x = {}
    if (!f.name.trim()) x.name = 'Enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Enter a valid email.'
    if (f.msg.trim().length < 10) x.msg = 'Write at least 10 characters.'
    setErr(x)
    if (Object.keys(x).length) return toast('Fix the highlighted fields.', 'error')
    setF({ name: '', email: '', msg: '' }); toast('Demo only: your message was not sent anywhere.', 'info')
  }
  return (
    <>
      <div className="head"><div><h1>Help & Support</h1><p className="muted">Answers and workflow guides.</p></div></div>
      <div className="grid g2">
        <div className="card"><span className="ico c"><ShieldCheck size={18} /></span><h3>Verification workflow</h3><p className="sm muted">Upload one document, click Verify Document, then review the summary, extracted fields and observations.</p></div>
        <div className="card"><span className="ico v"><GitCompare size={18} /></span><h3>Comparison workflow</h3><p className="sm muted">Select Document A and Document B, click Compare Documents, then review similarity and differences.</p></div>
      </div>
      <div className="card"><h3>Frequently asked questions</h3>{faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p className="sm muted">{a}</p></details>)}</div>
      <form className="card" onSubmit={send} noValidate><h3>Contact us</h3>
        {[['name', 'Name'], ['email', 'Email']].map(([k, l]) => <div className="field" key={k}><label htmlFor={`c-${k}`}>{l}</label><div className={`inp-wrap ${err[k] ? 'bad' : ''}`}><input id={`c-${k}`} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} /></div>{err[k] && <span className="err" role="alert">{err[k]}</span>}</div>)}
        <div className="field"><label htmlFor="c-msg">Message</label><div className={`inp-wrap ${err.msg ? 'bad' : ''}`}><textarea id="c-msg" rows="4" value={f.msg} onChange={e => setF({ ...f, msg: e.target.value })} /></div>{err.msg && <span className="err" role="alert">{err.msg}</span>}</div>
        <button className="btn pri">Send message</button>
      </form>
    </>
  )
}
