import { useEffect, useState } from 'react'
import { Files, CheckCircle2, Clock, GitCompare } from 'lucide-react'
const icons = { files: Files, check: CheckCircle2, clock: Clock, compare: GitCompare }
export default function StatCard({ label, value, trend, icon, color }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(value); return }
    let raf, t0
    const step = t => { t0 ??= t; const k = Math.min((t - t0) / 900, 1); setN(Math.round(value * k)); if (k < 1) raf = requestAnimationFrame(step) }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])
  const Ic = icons[icon]
  return (
    <div className="card stat">
      <div className={`ico ${color}`}><Ic size={20} /></div>
      <div><div className="muted sm">{label}</div><div className="big">{n}</div></div>
      <span className="trend sm">{trend} demo</span>
    </div>
  )
}
