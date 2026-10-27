import { useState } from 'react'
import { useApp } from '../hooks/useApp.jsx'
export default function Settings() {
  const { user, setUser, theme, setTheme, toast } = useApp()
  const [p, setP] = useState({ name: user.name, email: 'alex@example.com', role: 'Analyst' })
  const [n, setN] = useState({ email: true, flagged: true, weekly: false })
  const save = e => { e.preventDefault(); if (p.name.trim().length < 2) return toast('Enter a name with at least 2 characters.', 'error'); setUser({ name: p.name.trim() }); toast('Settings saved for this session.', 'success') }
  return (
    <>
      <div className="head"><div><h1>Settings</h1><p className="muted">Changes are kept in this browser session only.</p></div></div>
      <form onSubmit={save} className="grid g2">
        <div className="card"><h3>Profile</h3>
          {[['name', 'Full name'], ['email', 'Email'], ['role', 'Role']].map(([k, l]) => <div className="field" key={k}><label htmlFor={k}>{l}</label><div className="inp-wrap"><input id={k} value={p[k]} onChange={e => setP({ ...p, [k]: e.target.value })} /></div></div>)}</div>
        <div className="card"><h3>Appearance</h3>
          <div className="row gap">{['dark', 'light'].map(t => <label key={t} className="check"><input type="radio" name="theme" checked={theme === t} onChange={() => setTheme(t)} />{t[0].toUpperCase() + t.slice(1)}</label>)}</div>
          <h3>Notifications</h3>
          {[['email', 'Email updates'], ['flagged', 'Flagged document alerts'], ['weekly', 'Weekly summary']].map(([k, l]) => <label key={k} className="check block"><input type="checkbox" checked={n[k]} onChange={e => setN({ ...n, [k]: e.target.checked })} />{l}</label>)}</div>
        <div><button className="btn pri">Save changes</button></div>
      </form>
    </>
  )
}
