import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false), [mobile, setMobile] = useState(false), loc = useLocation()
  const onMenu = () => (window.innerWidth < 800 ? setMobile(!mobile) : setCollapsed(!collapsed))
  return (
    <div className={`app ${collapsed ? 'collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} mobileOpen={mobile} close={() => setMobile(false)} />
      {mobile && <div className="scrim" onClick={() => setMobile(false)} />}
      <div className="main">
        <Topbar onMenu={onMenu} />
        <main className="page" key={loc.pathname}><Outlet /></main>
      </div>
    </div>
  )
}
