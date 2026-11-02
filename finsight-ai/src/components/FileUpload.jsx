import { useRef, useState } from 'react'
import { UploadCloud, FileText, X } from 'lucide-react'

const OK = ['pdf', 'doc', 'docx', 'txt']
export const fmtSize = b => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`

// Reusable single-file picker. Files can be up to 100 MB by default.
export default function FileUpload({ id, label, accent = 'c', file, onFile, onError, maxSizeMB = 100 }) {
  const input = useRef(null)
  const [over, setOver] = useState(false)
  const maxBytes = maxSizeMB * 1024 * 1024

  const pick = f => {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!OK.includes(ext)) return onError(`"${f.name}" is not supported. Use PDF, DOC, DOCX or TXT.`)
    if (f.size > maxBytes) return onError(`"${f.name}" is ${fmtSize(f.size)}. The limit is ${maxSizeMB} MB.`)
    if (f.size === 0) return onError(`"${f.name}" is empty.`)
    onFile(f)
  }

  const clear = () => { onFile(null); if (input.current) input.current.value = '' }

  return (
    <div className={`card upload ${accent}`}>
      <h3>{label}</h3>
      {file ? (
        <div className="picked">
          <FileText size={28} />
          <div className="grow">
            <strong>{file.name}</strong>
            <div className="muted sm">{file.name.split('.').pop().toUpperCase()} · {fmtSize(file.size)}</div>
          </div>
          <button className="icon-btn" onClick={clear} aria-label={`Remove ${file.name}`}><X size={18} /></button>
        </div>
      ) : (
        <div
          className={`drop ${over ? 'over' : ''}`}
          onDragOver={e => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={e => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]) }}
        >
          <UploadCloud size={36} />
          <p>Drag and drop a file here</p>
          <p className="muted sm">PDF, DOC, DOCX or TXT, up to {maxSizeMB} MB</p>
          <button className="btn" onClick={() => input.current.click()}>Browse Files</button>
        </div>
      )}
      <input
        ref={input}
        id={id}
        type="file"
        hidden
        accept=".pdf,.doc,.docx,.txt"
        aria-label={label}
        onChange={e => { pick(e.target.files[0]); e.target.value = '' }}
      />
    </div>
  )
}
