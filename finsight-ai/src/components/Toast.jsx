import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
export default function Toast({ toasts }) {
  const I = { success: CheckCircle2, error: AlertCircle, info: Info }
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map(t => { const Ic = I[t.type] || Info; return <div key={t.id} className={`toast ${t.type}`}><Ic size={18} />{t.msg}</div> })}
    </div>
  )
}
