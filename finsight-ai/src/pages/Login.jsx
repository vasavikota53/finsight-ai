import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, GitCompare, Sparkles, FileText, Bot, TrendingUp, Loader2, Play } from 'lucide-react'
import { useApp } from '../hooks/useApp.jsx'
const features = [[ShieldCheck, 'Intelligent Document Verification'], [GitCompare, 'Side-by-Side Document Comparison'], [Sparkles, 'AI-Powered Business Insights']]
const empty = { name: '', email: '', password: '', confirm: '', remember: false }

export default function Login() {
  const { login, toast } = useApp(), nav = useNavigate()
  const [mode, setMode] = useState('login'), [f, setF] = useState(empty), [err, setErr] = useState({}), [show, setShow] = useState(false), [busy, setBusy] = useState(false)
  const signup = mode === 'signup'
  const set = k => e => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const enter = name => { login(name); toast('Entered demo mode. No real account was used.', 'success'); nav('/') }
  const submit = ev => {
    ev.preventDefault()
    const e = {}
    if (signup && f.name.trim().length < 2) e.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email like name@company.com.'
    if (f.password.length < 6) e.password = 'Use at least 6 characters.'
    if (signup && f.confirm !== f.password) e.confirm = 'Passwords do not match.'
    setErr(e)
    if (Object.keys(e).length) return toast('Fix the highlighted fields and try again.', 'error')
    setBusy(true)
    setTimeout(() => { setBusy(false); const n = signup ? f.name.trim() : f.email.split('@')[0]; enter(n.charAt(0).toUpperCase() + n.slice(1)) }, 900)
  }
  const field = (k, label, type = 'text', auto) => (
    <div className="field">
      <label htmlFor={k}>{label}</label>
      <div className={`inp-wrap ${err[k] ? 'bad' : ''}`}>
        <input id={k} type={type === 'password' && show ? 'text' : type} value={f[k]} onChange={set(k)} autoComplete={auto} aria-invalid={!!err[k]} />
        {type === 'password' && <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
      </div>
      {err[k] && <span className="err" role="alert">{err[k]}</span>}
    </div>
  )
  return (
    <div className="auth">
      <section className="intro">
        <div className="glow g1" /><div className="glow g2" />
        <div className="brand big-brand"><span className="logo"><Sparkles size={20} /></span>FinSight AI</div>
        <h1>Transform Financial Documents into Intelligent Decisions.</h1>
        <p className="muted">AI agents will help you verify documents, compare versions and surface financial insights. This build is the phase 1 interface, running on demo data.</p>
        <div className="viz" aria-hidden="true">
          <svg viewBox="0 0 320 120" className="nodes">
            <path d="M40 60 L160 25 L280 60 M160 25 L160 98 M40 60 L160 98 L280 60" />
            {[[40, 60], [160, 25], [280, 60], [160, 98]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" style={{ animationDelay: `${i * 400}ms` }} />)}
          </svg>
          <div className="fcard fc1"><FileText size={16} />Q3_Report.pdf</div>
          <div className="fcard fc2"><Bot size={16} />Agent: Verifier</div>
          <div className="fcard fc3"><TrendingUp size={16} />+6.4% insight</div>
        </div>
        <ul className="feats">{features.map(([Ic, t]) => <li key={t}><span className="ico c"><Ic size={18} /></span>{t}</li>)}</ul>
      </section>
      <section className="authside">
        <div className="card authcard">
          <h2>{signup ? 'Create your account' : 'Welcome back'}</h2>
          <p className="demo-note sm">Demo authentication only. No real accounts or passwords are stored.</p>
          <form key={mode} className="fade" onSubmit={submit} noValidate>
            {signup && field('name', 'Full name', 'text', 'name')}
            {field('email', 'Email address', 'email', 'email')}
            {field('password', 'Password', 'password', signup ? 'new-password' : 'current-password')}
            {signup && field('confirm', 'Confirm password', 'password', 'new-password')}
            {!signup && (
              <div className="row between">
                <label className="check"><input type="checkbox" checked={f.remember} onChange={set('remember')} />Remember me</label>
                <a href="#forgot" onClick={e => { e.preventDefault(); toast('Password reset is not available in the demo.', 'info') }}>Forgot password?</a>
              </div>
            )}
            <button className="btn pri wide" disabled={busy}>{busy ? <><Loader2 className="spin" size={18} />Please wait</> : signup ? 'Create Account' : 'Login'}</button>
          </form>
          <button className="btn wide" onClick={() => enter('Alex')}><Play size={16} />Enter Demo Mode</button>
          <p className="sm center">{signup ? 'Already have an account?' : 'New to FinSight AI?'}{' '}
            <button className="link" onClick={() => { setMode(signup ? 'login' : 'signup'); setErr({}); setF(empty) }}>{signup ? 'Login' : 'Sign Up'}</button></p>
        </div>
      </section>
    </div>
  )
}
