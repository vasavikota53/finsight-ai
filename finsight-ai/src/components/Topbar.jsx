import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Sun, Moon, User, Settings, LogOut } from 'lucide-react'
import { useApp } from '../hooks/useApp.jsx'
export default function Topbar({ onMenu }) {
  const { user, theme, setTheme, logout } = useApp(), nav = useNavigate()
  const [q, setQ] = useState(''), [menu, setMenu] = useState(null)
  const toggle = m => setMenu(menu === m ? null : m)
  return (
    <header className="top">
      <button className="icon-btn" onClick={onMenu} aria-label="Toggle sidebar"><Menu size={20} /></button>
      <form className="search" role="search" onSubmit={e => { e.preventDefault(); nav(`/history?q=${encodeURIComponent(q)}`) }}>
        <Search size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search analysis history" aria-label="Search analysis history" />
      </form>
      <div className="grow" />
      <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button>
      <div className="pop-wrap">
        <button className="icon-btn" onClick={() => toggle('n')} aria-label="Notifications"><Bell size={20} /><i className="dot" /></button>
        {menu === 'n' && <div className="pop"><strong>Notifications (demo)</strong><p className="sm">Vendor_Invoice_0912.docx was flagged.</p><p className="sm">Q3 report comparison completed.</p></div>}
      </div>
      <div className="pop-wrap">
        <button className="avatar" onClick={() => toggle('p')} aria-label="Profile menu">{user.name[0].toUpperCase()}</button>
        {menu === 'p' && <div className="pop">
          <strong>{user.name}</strong><span className="muted sm">Demo account</span>
          <button className="pop-item" onClick={() => { setMenu(null); nav('/settings') }}><Settings size={16} />Settings</button>
          <button className="pop-item" onClick={() => { logout(); nav('/login') }}><LogOut size={16} />Logout</button>
        </div>}
      </div>
    </header>
  )
}
