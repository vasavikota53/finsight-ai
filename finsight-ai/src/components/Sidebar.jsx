import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShieldCheck, GitCompare, History, BarChart3, Settings, LifeBuoy, LogOut, Sparkles, AlertOctagon } from 'lucide-react'
import { useApp } from '../hooks/useApp.jsx'
const items = [
  ['/', 'Overview', LayoutDashboard],
  ['/red-flags', 'Red Flag Agent', AlertOctagon],
  ['/verify', 'Document Verification', ShieldCheck],
  ['/compare', 'Document Comparison', GitCompare],
  ['/history', 'Analysis History', History],
  ['/reports', 'Reports & Insights', BarChart3],
  ['/settings', 'Settings', Settings],
  ['/help', 'Help & Support', LifeBuoy],
]
export default function Sidebar({ collapsed, mobileOpen, close }) {
  const { logout, toast } = useApp(), nav = useNavigate()
  return (
    <aside className={`side ${collapsed ? 'col' : ''} ${mobileOpen ? 'open' : ''}`} aria-label="Main navigation">
      <div className="brand"><span className="logo"><Sparkles size={18} /></span><span className="lbl">FinSight AI</span></div>
      <nav>
        {items.map(([to, text, Ic]) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={close} title={text} className={({ isActive }) => `nav ${isActive ? 'active' : ''}`}>
            <Ic size={20} /><span className="lbl">{text}</span>
          </NavLink>
        ))}
      </nav>
      <button className="nav out" onClick={() => { logout(); toast('Logged out of demo mode', 'info'); nav('/login') }} title="Logout">
        <LogOut size={20} /><span className="lbl">Logout</span>
      </button>
    </aside>
  )
}
