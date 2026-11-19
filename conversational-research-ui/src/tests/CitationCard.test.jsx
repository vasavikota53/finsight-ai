import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CitationCard from '../components/CitationCard.jsx'

const citation = {
  document_id:   'doc-1',
  document_name: 'Acme Corp Annual Report FY2024.pdf',
  company:       'Acme Corp',
  page:          42,
  excerpt:       'Revenue grew by 23.4% to ₹18,420 crore in FY2024.',
  file_url:      null,
}

const citationWithPdf = {
  ...citation,
  file_url: 'https://example.com/report.pdf',
}

describe('CitationCard', () => {
  it('renders company name', () => {
    render(<CitationCard citation={citation} index={0} onClick={() => {}} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renders page number', () => {
    render(<CitationCard citation={citation} index={0} onClick={() => {}} />)
    expect(screen.getByText('p.42')).toBeInTheDocument()
  })

  it('renders excerpt text (truncated)', () => {
    render(<CitationCard citation={citation} index={0} onClick={() => {}} />)
    expect(screen.getByText(/Revenue grew by/)).toBeInTheDocument()
  })

  it('renders footnote index label', () => {
    render(<CitationCard citation={citation} index={0} onClick={() => {}} />)
    expect(screen.getByText('[1]')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<CitationCard citation={citation} index={0} onClick={onClick} />)
    // Click the card itself (role=button)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith(citation)
  })

  it('shows PDF link when file_url is provided', () => {
    render(<CitationCard citation={citationWithPdf} index={0} onClick={() => {}} />)
    expect(screen.getByRole('link', { name: /open pdf/i })).toBeInTheDocument()
  })

  it('does not show PDF link when file_url is null', () => {
    render(<CitationCard citation={citation} index={0} onClick={() => {}} />)
    expect(screen.queryByRole('link', { name: /open pdf/i })).not.toBeInTheDocument()
  })

  it('handles missing excerpt gracefully', () => {
    const noExcerpt = { ...citation, excerpt: null }
    render(<CitationCard citation={noExcerpt} index={0} onClick={() => {}} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    // No excerpt text
    expect(screen.queryByText(/Revenue grew/)).not.toBeInTheDocument()
  })
})
