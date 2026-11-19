import React from 'react'
import { ExternalLink, Info } from 'lucide-react'

/**
 * ComparisonTable
 * Renders structured comparison data returned by the Comparison Agent.
 * Never invents missing values — shows "N/A" instead.
 */
export default function ComparisonTable({ data, onCitationClick }) {
  if (!data || data.length === 0) return null

  const fields = [
    { key: 'financial_year',   label: 'Financial Year' },
    { key: 'revenue',          label: 'Revenue' },
    { key: 'net_profit',       label: 'Net Profit' },
    { key: 'operating_margin', label: 'Operating Margin' },
    { key: 'debt',             label: 'Total Debt' },
  ]

  return (
    <div className="mt-4 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b"
        style={{
          background:   'var(--bg-tertiary)',
          borderColor:  'var(--border-color)',
          color:        'var(--text-secondary)',
        }}
      >
        <Info size={12} style={{ color: 'var(--accent)' }} />
        Comparison Agent — Financial Data Table
        <span className="ml-auto text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
          Figures sourced from uploaded documents
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="comparison-table w-full">
          <thead>
            <tr>
              <th className="text-left min-w-[140px]">Metric</th>
              {data.map((row, i) => (
                <th key={i} className="text-left min-w-[160px]">
                  <div>
                    {row.company}
                    {row.currency && (
                      <span
                        className="ml-1.5 font-normal text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        ({row.currency})
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map(({ key, label }) => (
              <tr key={key}>
                <td className="font-medium text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {label}
                </td>
                {data.map((row, ci) => (
                  <td key={ci}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {row[key] ?? (
                          <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                        )}
                      </span>
                      {/* Citation links for this cell */}
                      {row.citations?.length > 0 && onCitationClick && (
                        <div className="flex gap-1 flex-wrap">
                          {row.citations.map((cit, ci2) => (
                            <button
                              key={ci2}
                              onClick={() => onCitationClick(cit)}
                              className="text-xs hover:underline flex items-center gap-0.5"
                              style={{ color: 'var(--accent)', fontSize: '0.65rem' }}
                              aria-label={`View source for ${row.company}`}
                            >
                              <ExternalLink size={9} />
                              p.{cit.page}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div
        className="px-4 py-2 text-xs border-t"
        style={{
          background:  'var(--bg-tertiary)',
          borderColor: 'var(--border-color)',
          color:       'var(--text-muted)',
        }}
      >
        ⚠ Companies may use different reporting currencies, periods, and accounting standards. Direct comparison requires normalization.
      </div>
    </div>
  )
}
