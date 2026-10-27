
import { useState } from 'react'
import {
  GitCompare,
  RotateCcw,
  Loader2,
  Search,
  FileText,
  Sparkles,
} from 'lucide-react'

import FileUpload from '../components/FileUpload.jsx'
import { compareDocuments } from '../services/comparisonService.js'
import { searchDocuments } from '../services/documentSearchService.js'
import { useApp } from '../hooks/useApp.jsx'

export default function DocumentComparison() {
  const { toast } = useApp()

  // Existing demo comparison state
  const [a, setA] = useState(null)
  const [b, setB] = useState(null)
  const [busy, setBusy] = useState(false)
  const [pct, setPct] = useState(0)
  const [res, setRes] = useState(null)

  // New real AI document search state
  const [question, setQuestion] = useState('')
  const [company, setCompany] = useState('all')
  const [searchBusy, setSearchBusy] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [searchRes, setSearchRes] = useState(null)

  // Existing demo comparison
  const run = async () => {
    setBusy(true)
    setRes(null)
    setPct(0)

    try {
      setRes(await compareDocuments(a, b, setPct))
      toast('Demo comparison finished.', 'success')
    } catch {
      toast('Demo comparison failed. Try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setA(null)
    setB(null)
    setRes(null)
    setPct(0)
  }

  // Real search through the Python Document Agent API
  const runSearch = async (event) => {
    event.preventDefault()

    if (!question.trim()) {
      setSearchError('Please enter a question about the financial reports.')
      return
    }

    setSearchBusy(true)
    setSearchError('')
    setSearchRes(null)

    try {
      const data = await searchDocuments(question, company)
      setSearchRes(data)
    } catch (error) {
      setSearchError(
        error.message ||
          'Unable to search documents. Check whether the Python API is running.'
      )
    } finally {
      setSearchBusy(false)
    }
  }

  return (
    <>
      <div className="head">
        <div>
          <h1>Document Comparison</h1>
          <p className="muted">
            Compare documents and search financial reports using AI.
          </p>
        </div>
      </div>

      {/* NEW: Real AI Document Search */}
      <section className="card" style={{ marginTop: 20, marginBottom: 20 }}>
        <div className="row gap">
          <div className="ico c">
            <Sparkles size={20} />
          </div>
          <div>
            <h3>AI Financial Document Search</h3>
            <p className="muted sm">
              Ask questions and retrieve relevant passages from indexed annual
              reports using semantic search.
            </p>
          </div>
        </div>

        <form onSubmit={runSearch}>
          <div className="field" style={{ marginTop: 18 }}>
            <label htmlFor="ai-question">Your question</label>
            <div className="inp-wrap">
              <input
                id="ai-question"
                type="text"
                placeholder="e.g. What are Amazon's major business risks?"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                maxLength={1000}
                disabled={searchBusy}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="ai-company">Search company</label>
            <select
              id="ai-company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              disabled={searchBusy}
              style={{ width: '100%' }}
            >
              <option value="all">All companies</option>
              <option value="Amazon">Amazon</option>
              <option value="Apple">Apple</option>
            </select>
          </div>

          <button
            className="btn pri"
            type="submit"
            disabled={searchBusy || !question.trim()}
          >
            {searchBusy ? (
              <Loader2 size={16} className="spin" />
            ) : (
              <Search size={16} />
            )}
            {searchBusy ? 'Searching reports...' : 'Search Documents'}
          </button>
        </form>

        {searchBusy && (
          <p className="muted sm" style={{ marginTop: 14 }}>
            Searching the indexed financial documents. This may take a moment.
          </p>
        )}

        {searchError && (
          <div className="demo-note" role="alert" style={{ marginTop: 16 }}>
            {searchError}
          </div>
        )}

        {searchRes && (
          <div className="fade" style={{ marginTop: 24 }}>
            <div className="row between wrap gap">
              <div>
                <h3>Search Results</h3>
                <p className="muted sm">
                  Question: {searchRes.question}
                </p>
              </div>
              <span className="badge ok">
                {searchRes.count} passages found
              </span>
            </div>

            <p className="muted sm">
              Source scope: {searchRes.company}
            </p>

            {searchRes.results.length === 0 ? (
              <p className="muted">
                No matching passages were found. Try a different question.
              </p>
            ) : (
              <div className="grid">
                {searchRes.results.map((item, index) => (
                  <article className="card" key={`${item.source}-${item.chunk_id}-${index}`}>
                    <div className="row between wrap gap">
                      <div className="row gap">
                        <FileText size={18} color="var(--c)" />
                        <strong className="sm">{item.source}</strong>
                      </div>
                      <span className="badge">
                        Result {index + 1}
                      </span>
                    </div>

                    <p className="muted sm">
                      Chunk ID: {item.chunk_id}
                    </p>

                    <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                      {item.text}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* EXISTING: Demo Document Comparison — preserved */}
      <h2 style={{ marginTop: 24 }}>Compare Two Documents</h2>
      <p className="demo-note sm">
        DEMO: This comparison is simulated and files never leave this browser.
      </p>

      <div className="grid g2">
        <FileUpload
          id="doc-a"
          label="Document A: Original"
          accent="c"
          file={a}
          onFile={(f) => {
            setA(f)
            setRes(null)
          }}
          onError={(m) => toast(m, 'error')}
        />

        <FileUpload
          id="doc-b"
          label="Document B: Comparison"
          accent="v"
          file={b}
          onFile={(f) => {
            setB(f)
            setRes(null)
          }}
          onError={(m) => toast(m, 'error')}
        />
      </div>

      {busy && (
        <div className="card">
          <div className="row between sm">
            <span>
              <Loader2 className="spin" size={14} /> Comparing documents (demo)
            </span>
            <span>{pct}%</span>
          </div>
          <div className="bar-track">
            <div style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="row gap" style={{ marginTop: 16 }}>
        <button
          className="btn pri"
          disabled={!a || !b || busy}
          onClick={run}
        >
          <GitCompare size={16} />
          Compare Documents
        </button>

        {(a || b || res) && (
          <button className="btn" onClick={reset} disabled={busy}>
            <RotateCcw size={16} />
            Reset
          </button>
        )}
      </div>

      {!a || !b ? (
        <p className="muted sm">
          Select both documents to enable comparison.
        </p>
      ) : null}

      {res && (
        <div className="card fade">
          <h3>
            Results <span className="badge wn">SIMULATED</span>
          </h3>

          <div className="row gap wrap">
            <div className="ring">
              <b>{res.similarity}%</b>
              <span className="sm muted">similarity</span>
            </div>
            <p className="grow">{res.summary}</p>
          </div>

          <div className="grid g2">
            <div>
              <h4>Matching</h4>
              <ul>
                {res.matches.map((m) => (
                  <li key={m} className="sm">{m}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Differences</h4>
              <ul>
                {res.differences.map((m) => (
                  <li key={m} className="sm">{m}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Document A</th>
                  <th>Document B</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {res.rows.map((r) => (
                  <tr key={r.field}>
                    <td>{r.field}</td>
                    <td>{r.a}</td>
                    <td>{r.b}</td>
                    <td>
                      <span
                        className={`badge ${
                          r.state === 'same'
                            ? 'ok'
                            : r.state === 'changed'
                              ? 'wn'
                              : 'er'
                        }`}
                      >
                        {r.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

