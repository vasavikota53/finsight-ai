import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './hooks/useApp.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import DocumentVerification from './pages/DocumentVerification.jsx'
import RedFlagAudit from './pages/RedFlagAudit.jsx'
import DocumentComparison from './pages/DocumentComparison.jsx'
import AnalysisHistory from './pages/AnalysisHistory.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import HelpSupport from './pages/HelpSupport.jsx'

function Protected({ children }) {
  const { user } = useApp()
  return user ? children : <Navigate to="/login" replace />
}
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><DashboardLayout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="red-flags" element={<RedFlagAudit />} />
        <Route path="verify" element={<DocumentVerification />} />
        <Route path="compare" element={<DocumentComparison />} />
        <Route path="history" element={<AnalysisHistory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<HelpSupport />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
