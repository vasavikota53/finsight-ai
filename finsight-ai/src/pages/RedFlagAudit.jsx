import { useState, useEffect } from 'react'
import {
  FileText,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  TrendingDown,
  DollarSign,
  ShieldAlert,
  Search,
} from 'lucide-react'
import FileUpload from '../components/FileUpload.jsx'
import { useApp } from '../hooks/useApp.jsx'
import {
  scanDocumentPDF,
  scanText,
  getRedFlagHealth,
} from '../services/redFlagService.js'

export default function RedFlagAudit() {
  const { toast } = useApp()
  const [activeTab, setActiveTab] = useState('upload') // 'upload' | 'text'
  const [file, setFile] = useState(null)
  const [customText, setCustomText] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [filterSeverity, setFilterSeverity] = useState('ALL')
  const [apiOnline, setApiOnline] = useState(null)

  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    try {
      const res = await getRedFlagHealth()
      setApiOnline(true)
    } catch {
      setApiOnline(false)
    }
  }

  const handleUploadScan = async () => {
    if (!file) {
      toast('Please select a PDF file first.', 'error')
      return
    }
    setLoading(true)
    setReport(null)
    try {
      const data = await scanDocumentPDF(file, companyName)
      setReport(data)
      toast(`Live Red Flag audit completed for ${data.company_name}!`, 'success')
    } catch (err) {
      toast(`PDF Audit failed: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleTextScan = async () => {
    if (!customText.trim()) {
      toast('Please enter financial narrative or disclosures to scan.', 'error')
      return
    }
    setLoading(true)
    setReport(null)
    try {
      const data = await scanText(customText, companyName || 'Custom Corporation')
      setReport(data)
      toast(`Text forensic audit completed!`, 'success')
    } catch (err) {
      toast(`Text scan failed: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    if (!report) return
    const content = `FINSIGHT AI - RED FLAG FORENSIC AUDIT REPORT\n` +
      `Target Company: ${report.company_name}\n` +
      `Timestamp: ${report.analyzed_at}\n` +
      `Overall Risk Score: ${report.overall_risk_score} / 100 (${report.overall_risk_level})\n\n` +
      `EXECUTIVE SUMMARY:\n${report.executive_summary}\n\n` +
      `KEY FINDINGS:\n` +
      report.flags.map((f, i) => `#${i + 1} [${f.severity}] ${f.title}\n   Category: ${f.category}\n   Details: ${f.description}\n   Evidence: ${f.evidence || 'N/A'}\n   Forensic Risk: ${f.implications}\n`).join('\n')
    
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.company_name.replace(/\s+/g, '_')}_Red_Flag_Report.md`
    a.click()
    URL.revokeObjectURL(url)
    toast('Audit report downloaded successfully.', 'success')
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'var(--er)'
      case 'HIGH': return '#f97316'
      case 'MODERATE': return 'var(--wn)'
      case 'LOW': return 'var(--ok)'
      default: return 'var(--mu)'
    }
  }

  const filteredFlags = report ? report.flags.filter(f => filterSeverity === 'ALL' || f.severity === filterSeverity) : []

  return (
    <>
      <div className="head">
        <div>
          <h1>Red Flag Forensic Agent</h1>
          <p className="muted">
            Automated scanning for debt distress, margin compression, auditor qualifications, and unusual financial patterns.
          </p>
        </div>
        <div className="row gap">
          <span className={`badge ${apiOnline ? 'ok' : 'wn'}`}>
            Backend Agent: {apiOnline ? 'Active (Port 8000/8001)' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="row gap wrap" style={{ margin: '14px 0' }}>
        <button
          className="btn"
          style={{
            background: activeTab === 'upload' ? '#2563eb' : '#1e293b',
            color: '#ffffff',
            border: activeTab === 'upload' ? '1px solid #3b82f6' : '1px solid #334155',
            fontWeight: 600,
          }}
          onClick={() => setActiveTab('upload')}
        >
          <Upload size={16} /> Upload PDF Document
        </button>
        <button
          className="btn"
          style={{
            background: activeTab === 'text' ? '#2563eb' : '#1e293b',
            color: '#ffffff',
            border: activeTab === 'text' ? '1px solid #3b82f6' : '1px solid #334155',
            fontWeight: 600,
          }}
          onClick={() => setActiveTab('text')}
        >
          <FileText size={16} /> Custom Disclosure Excerpt
        </button>
      </div>

      {/* Upload PDF */}
      {activeTab === 'upload' && (
        <div className="card">
          <h3>Audit an Uploaded Financial PDF</h3>
          <p className="muted sm">
            The Red Flag Agent will extract all pages, segment the auditor's report, parse financial line items, and run forensic tests automatically.
          </p>
          <div className="field" style={{ marginTop: '12px', maxWidth: '400px' }}>
            <label>Company Name (optional)</label>
            <div className="inp-wrap">
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>
          <FileUpload
            id="redflag-pdf-upload"
            label="Upload Financial Statement / Annual Report (PDF)"
            file={file}
            onFile={(f) => { setFile(f); setReport(null) }}
            onError={(m) => toast(m, 'error')}
          />
          <div className="row gap" style={{ marginTop: '14px' }}>
            <button
              className="btn pri"
              disabled={!file || loading}
              onClick={handleUploadScan}
            >
              {loading ? <Loader2 className="spin" size={16} /> : <ShieldAlert size={16} />}
              Execute Full Red Flag Audit
            </button>
            {file && (
              <button className="btn" onClick={() => { setFile(null); setReport(null) }} disabled={loading}>
                <RotateCcw size={16} /> Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Custom Text */}
      {activeTab === 'text' && (
        <div className="card">
          <h3>Scan Disclosure Excerpts or Audit Footnotes</h3>
          <div className="field" style={{ maxWidth: '400px' }}>
            <label>Company Name</label>
            <div className="inp-wrap">
              <input
                type="text"
                placeholder="e.g. BioPharma Global"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label>Paste Report Footnotes, Auditor's Opinion, or MD&A Excerpt</label>
            <div className="inp-wrap" style={{ padding: '4px' }}>
              <textarea
                rows={6}
                placeholder="e.g. The independent auditor expressed substantial doubt regarding the entity's ability to continue as a going concern..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
            </div>
          </div>
          <button
            className="btn pri"
            disabled={!customText.trim() || loading}
            onClick={handleTextScan}
          >
            {loading ? <Loader2 className="spin" size={16} /> : <Search size={16} />}
            Scan Disclosures
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="card fade" style={{ textAlign: 'center', padding: '36px' }}>
          <Loader2 className="spin" size={32} style={{ margin: '0 auto 12px' }} />
          <h3>Red Flag Agent is analyzing financial statements...</h3>
          <p className="muted sm">
            Evaluating debt maturity, gross & operating margin compression, auditor opinions, Beneish M-Score accruals, and regulatory disclosures.
          </p>
        </div>
      )}

      {/* Report Display */}
      {report && !loading && (
        <div className="fade" style={{ marginTop: '20px' }}>
          {/* Executive Risk Banner */}
          <div className="card" style={{ borderLeft: `6px solid ${getRiskColor(report.overall_risk_level)}` }}>
            <div className="row between wrap">
              <div>
                <h2>{report.company_name} — Forensic Audit Assessment</h2>
                <div className="muted sm">
                  Scan Source: {report.scan_source} · Timestamp: {report.analyzed_at}
                </div>
              </div>
              <div className="row gap" style={{ marginTop: '8px' }}>
                <button className="btn pri" onClick={downloadReport}>
                  <Download size={16} /> Download Full Report
                </button>
              </div>
            </div>

            <div className="grid g4" style={{ marginTop: '16px' }}>
              <div className="stat card" style={{ background: 'var(--bg2)' }}>
                <div>
                  <div className="muted sm">Overall Forensic Score</div>
                  <div className="big" style={{ color: getRiskColor(report.overall_risk_level) }}>
                    {report.overall_risk_score} <span style={{ fontSize: '1rem' }}>/ 100</span>
                  </div>
                </div>
              </div>

              <div className="stat card" style={{ background: 'var(--bg2)' }}>
                <div>
                  <div className="muted sm">Forensic Risk Level</div>
                  <div className="big" style={{ color: getRiskColor(report.overall_risk_level), fontSize: '1.3rem' }}>
                    {report.overall_risk_level} RISK
                  </div>
                </div>
              </div>

              <div className="stat card" style={{ background: 'var(--bg2)' }}>
                <div>
                  <div className="muted sm">Total Red Flags Detected</div>
                  <div className="big">{report.total_flags}</div>
                </div>
              </div>

              <div className="stat card" style={{ background: 'var(--bg2)' }}>
                <div>
                  <div className="muted sm">Critical Severity Alerts</div>
                  <div className="big" style={{ color: 'var(--er)' }}>
                    {report.flags_count_by_severity.CRITICAL || 0}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <h4>Executive Summary</h4>
              <p>{report.executive_summary}</p>
            </div>

            {report.key_takeaways && report.key_takeaways.length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <h4>Key Takeaways</h4>
                <ul style={{ paddingLeft: '20px', margin: '6px 0' }}>
                  {report.key_takeaways.map((k, idx) => (
                    <li key={idx} className="sm" style={{ marginBottom: '4px' }}>
                      {k}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Computed Financial Ratios */}
          {report.ratios && (
            <div className="card" style={{ marginTop: '16px' }}>
              <h3>Computed Financial & Forensic Ratios</h3>
              <div className="grid g4 tight">
                <div className="kpi">
                  <div className="muted sm">Debt-to-Equity</div>
                  <div className="big">{report.ratios.debt_to_equity !== null ? `${report.ratios.debt_to_equity}x` : 'N/A'}</div>
                  <div className="muted sm">Warning: &gt;1.5x</div>
                </div>
                <div className="kpi">
                  <div className="muted sm">Interest Coverage</div>
                  <div className="big">{report.ratios.interest_coverage !== null ? `${report.ratios.interest_coverage}x` : 'N/A'}</div>
                  <div className="muted sm">Distress: &lt;1.0x</div>
                </div>
                <div className="kpi">
                  <div className="muted sm">Gross Margin %</div>
                  <div className="big">{report.ratios.gross_margin_pct !== null ? `${report.ratios.gross_margin_pct}%` : 'N/A'}</div>
                  <div className="muted sm">Compression: &gt;200 bps</div>
                </div>
                <div className="kpi">
                  <div className="muted sm">Operating Margin %</div>
                  <div className="big">{report.ratios.operating_margin_pct !== null ? `${report.ratios.operating_margin_pct}%` : 'N/A'}</div>
                  <div className="muted sm">Loss if &lt;0%</div>
                </div>
                <div className="kpi">
                  <div className="muted sm">Days Sales Out. (DSO)</div>
                  <div className="big">{report.ratios.days_sales_outstanding !== null ? `${report.ratios.days_sales_outstanding} d` : 'N/A'}</div>
                  <div className="muted sm">Warning: &gt;75 d</div>
                </div>
                <div className="kpi">
                  <div className="muted sm">Days Inventory (DIO)</div>
                  <div className="big">{report.ratios.days_inventory_outstanding !== null ? `${report.ratios.days_inventory_outstanding} d` : 'N/A'}</div>
                  <div className="muted sm">Warning: &gt;90 d</div>
                </div>
                <div className="kpi">
                  <div className="muted sm">CFO / Net Income</div>
                  <div className="big">{report.ratios.operating_cash_flow_to_net_income !== null ? `${report.ratios.operating_cash_flow_to_net_income}x` : 'N/A'}</div>
                  <div className="muted sm">Divergence: &lt;0.4x</div>
                </div>
                <div className="kpi">
                  <div className="muted sm">Beneish DSRI Index</div>
                  <div className="big">{report.ratios.beneish_dsri !== null ? report.ratios.beneish_dsri : 'N/A'}</div>
                  <div className="muted sm">Manipulation: &gt;1.20</div>
                </div>
              </div>
            </div>
          )}

          {/* Itemized Findings */}
          <div className="card" style={{ marginTop: '16px' }}>
            <div className="row between wrap">
              <h3>Itemized Forensic Red Flags ({filteredFlags.length})</h3>
              <div className="row gap sm">
                <span>Filter Severity:</span>
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                  <button
                    key={lvl}
                    className={`btn sm-btn ${filterSeverity === lvl ? 'pri' : ''}`}
                    onClick={() => setFilterSeverity(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {filteredFlags.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <CheckCircle2 size={36} className="okc" style={{ margin: '0 auto 8px' }} />
                <h4>No flags match the selected filter.</h4>
              </div>
            ) : (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredFlags.map((flag, idx) => (
                  <div
                    key={flag.id || idx}
                    className="card"
                    style={{
                      background: 'var(--bg2)',
                      borderLeft: `5px solid ${getRiskColor(flag.severity)}`,
                      padding: '16px',
                    }}
                  >
                    <div className="row between wrap">
                      <strong>
                        #{idx + 1}. [{flag.id}] {flag.title}
                      </strong>
                      <span
                        className="badge"
                        style={{
                          background: flag.severity === 'CRITICAL' ? 'rgba(248,113,113,0.18)' : 'rgba(251,191,36,0.18)',
                          color: getRiskColor(flag.severity),
                        }}
                      >
                        {flag.severity}
                      </span>
                    </div>

                    <div className="muted sm" style={{ marginTop: '4px' }}>
                      Category: {flag.category} {flag.threshold_breached && `· Threshold: ${flag.threshold_breached}`}
                    </div>

                    <p style={{ marginTop: '8px' }}>{flag.description}</p>

                    {flag.evidence && (
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--bd)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '0.82rem',
                          fontFamily: 'monospace',
                          marginTop: '8px',
                          wordBreak: 'break-word',
                        }}
                      >
                        <strong>Citation / Calculation:</strong> {flag.evidence}
                      </div>
                    )}

                    <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                      <strong>Forensic Risk Implications:</strong> <span className="muted">{flag.implications}</span>
                    </div>

                    {flag.recommendations && flag.recommendations.length > 0 && (
                      <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                        <strong>Recommended Auditor Next Steps:</strong>
                        <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>
                          {flag.recommendations.map((rec, rIdx) => (
                            <li key={rIdx} className="muted">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
