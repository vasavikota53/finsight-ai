import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import Toast from '../components/Toast.jsx'
const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

// DEMO ONLY: only the display name is kept in sessionStorage. No passwords are stored anywhere.
export function AppProvider({ children }) {
  const [user, setUser] = useState(() => { const n = sessionStorage.getItem('fs_demo_user'); return n ? { name: n } : null })
  const [theme, setTheme] = useState(() => localStorage.getItem('fs_theme') || 'dark')
  const [toasts, setToasts] = useState([])
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('fs_theme', theme) }, [theme])
  const login = name => { sessionStorage.setItem('fs_demo_user', name); setUser({ name }) }
  const logout = () => { sessionStorage.removeItem('fs_demo_user'); setUser(null) }
  const toast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])
  return (
    <Ctx.Provider value={{ user, setUser, login, logout, theme, setTheme, toast }}>
      {children}<Toast toasts={toasts} />
    </Ctx.Provider>
  )
}
