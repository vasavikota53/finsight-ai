import React, { useState, useEffect } from 'react'
import ResearchWorkspace from './pages/ResearchWorkspace.jsx'

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('finresearch_theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('finresearch_theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ResearchWorkspace theme={theme} onToggleTheme={toggleTheme} />
  )
}
