import React, { useState, useEffect } from 'react'
import {
  FileText, Upload, CheckCircle2, Clock, AlertCircle,
  ChevronDown, ChevronUp, Search, X, Building2, Filter
} from 'lucide-react'
import { getDocuments, uploadDocument } from '../services/researchService.js'
import { formatRelativeTime, truncate } from '../utils/citationUtils.js'

const STATUS_CONFIG = {
  indexed:    { icon: CheckCircle2, color: '#22c55e', label: 'Indexed' },
  processing: { icon: Clock,         color: '#f59e0b', label: 'Processing' },
  failed:     { icon: AlertCircle,   color: '#ef4444', label: 'Failed' },
}

/**
 * DocumentSelector
 * Panel for browsing, selecting, and uploading financial documents.
 */
export default function DocumentSelector({ selectedIds, onSelectionChange }) {
  const [documents, setDocuments]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [company, setCompany]       = useState('all')
  const [uploading, setUploading]   = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = React.useRef(null)

  useEffect(() => {
    getDocuments()
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false))
  }, [])

  // Filter logic
  const companies = ['all', ...new Set(documents.map((d) => d.company).filter(Boolean))]
  const filtered = documents.filter((d) => {
    const matchesSearch  = !search  || d.name.toLowerCase().includes(search.toLowerCase()) || d.company?.toLowerCase().includes(search.toLowerCase())
    const matchesCompany = company === 'all' || d.company === company
    return matchesSearch && matchesCompany
  })

  function toggleSelect(id) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id]
    onSelectionChange(next)
  }

  function selectAll()   { onSelectionChange(filtered.filter((d) => d.status === 'indexed').map((d) => d.id)) }
  function clearAll()    { onSelectionChange([]) }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadProgress(0)
    try {
      const doc = await uploadDocument(file, setUploadProgress)
      setDocuments((prev) => [doc, ...prev])
      onSelectionChange([...selectedIds, doc.id])
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      e.target.value = ''
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search + Filter */}
      <div className="p-3 space-y-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border"
          style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
        >
          <Search size={13} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>

        {/* Company filter */}
        <div className="flex items-center gap-1.5">
          <Filter size={11} style={{ color: 'var(--text-muted)' }} />
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="flex-1 text-xs rounded-lg px-2 py-1 border outline-none"
            style={{
              background:  'var(--bg-primary)',
              borderColor: 'var(--border-color)',
              color:       'var(--text-primary)',
            }}
          >
            {companies.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Companies' : c}</option>
            ))}
          </select>
        </div>

        {/* Select / Clear all */}
        {filtered.length > 0 && (
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-xs hover:underline" style={{ color: 'var(--accent)' }}>
              Select all
            </button>
            <span style={{ color: 'var(--border-color)' }}>·</span>
            <button onClick={clearAll} className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }}>
              Clear
            </button>
            {selectedIds.length > 0 && (
              <span className="ml-auto text-xs font-medium" style={{ color: 'var(--accent)' }}>
                {selectedIds.length} selected
              </span>
            )}
          </div>
        )}
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && (
          <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>Loading documents…</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>
            No documents found. Upload one below.
          </p>
        )}
        {filtered.map((doc) => {
          const isSelected = selectedIds.includes(doc.id)
          const StatusIcon = STATUS_CONFIG[doc.status]?.icon ?? FileText
          const statusColor = STATUS_CONFIG[doc.status]?.color ?? 'var(--text-muted)'
          const statusLabel = STATUS_CONFIG[doc.status]?.label ?? doc.status
          const canSelect   = doc.status === 'indexed'

          return (
            <div
              key={doc.id}
              onClick={() => canSelect && toggleSelect(doc.id)}
              className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all duration-100 ${
                canSelect ? 'cursor-pointer hover:border-blue-400/50' : 'opacity-60'
              } ${isSelected ? 'border-blue-500/50' : ''}`}
              style={{
                background:  isSelected ? 'var(--accent)18' : 'var(--bg-primary)',
                borderColor: isSelected ? 'var(--accent)' : 'var(--border-color)',
              }}
              role={canSelect ? 'checkbox' : 'presentation'}
              aria-checked={isSelected}
              tabIndex={canSelect ? 0 : -1}
              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') canSelect && toggleSelect(doc.id) }}
            >
              {/* Checkbox */}
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  isSelected ? 'border-blue-500' : ''
                }`}
                style={{
                  background:  isSelected ? 'var(--accent)' : 'var(--bg-secondary)',
                  borderColor: isSelected ? 'var(--accent)' : 'var(--border-color)',
                }}
              >
                {isSelected && <span className="text-white text-xs">✓</span>}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {truncate(doc.name, 36)}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {doc.company && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Building2 size={9} /> {doc.company}
                    </span>
                  )}
                  {doc.pages && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{doc.pages}p</span>
                  )}
                  <span className="flex items-center gap-1 text-xs" style={{ color: statusColor }}>
                    <StatusIcon size={10} /> {statusLabel}
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {formatRelativeTime(doc.uploaded_at)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Upload section */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
        {uploading ? (
          <div className="space-y-1.5">
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--border-color)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%`, background: 'var(--accent)' }}
              />
            </div>
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Uploading… {uploadProgress}%
            </p>
          </div>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.xlsx"
              onChange={handleUpload}
              className="hidden"
              id="doc-upload-input"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border-dashed border text-xs font-medium transition-all hover:opacity-80"
              style={{
                borderColor: 'var(--accent)',
                color:       'var(--accent)',
                background:  'var(--accent)10',
              }}
            >
              <Upload size={13} />
              Upload Document
            </button>
            <p className="text-xs text-center mt-1" style={{ color: 'var(--text-muted)' }}>
              PDF, DOCX, XLSX supported
            </p>
          </>
        )}
      </div>
    </div>
  )
}
