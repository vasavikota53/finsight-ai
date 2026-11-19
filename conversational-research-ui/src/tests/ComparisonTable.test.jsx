import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ComparisonTable from '../components/ComparisonTable.jsx'

const data = [
  {
    company:          'Acme Corp',
    financial_year:   'FY2024',
    revenue:          '₹18,420 Cr',
    net_profit:       '₹2,948 Cr',
    operating_margin: '19.2%',
    debt:             '₹3,210 Cr',
    currency:         'INR',
    unit:             'Crore',
    citations: [
      {
        document_id:   'doc-1',
        document_name: 'Annual Report FY2024.pdf',
        company:       'Acme Corp',
        page:          42,
        excerpt:       'Revenue was ₹18,420 Cr.',
        file_url:      null,
      },
    ],
  },
  {
    company:          'Nexus Industries',
    financial_year:   'FY2024',
    revenue:          'USD 4.2 Bn',
    net_profit:       null,         // missing value
    operating_margin: '14.6%',
    debt:             'USD 1.1 Bn',
    currency:         'USD',
    unit:             'Billion',
    citations:        [],
  },
]

describe('ComparisonTable', () => {
  it('renders company columns', () => {
    render(<ComparisonTable data={data} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Nexus Industries')).toBeInTheDocument()
  })

  it('renders revenue values', () => {
    render(<ComparisonTable data={data} />)
    expect(screen.getByText('₹18,420 Cr')).toBeInTheDocument()
    expect(screen.getByText('USD 4.2 Bn')).toBeInTheDocument()
  })

  it('shows N/A for missing values, not invented data', () => {
    render(<ComparisonTable data={data} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
    // Specifically net profit for Nexus should be N/A
    const naElements = screen.getAllByText('N/A')
    expect(naElements.length).toBeGreaterThan(0)
  })

  it('renders operating margins', () => {
    render(<ComparisonTable data={data} />)
    expect(screen.getByText('19.2%')).toBeInTheDocument()
    expect(screen.getByText('14.6%')).toBeInTheDocument()
  })

  it('renders citation page link buttons when onCitationClick is provided', () => {
    const onClick = vi.fn()
    render(<ComparisonTable data={data} onCitationClick={onClick} />)
    // Acme has citations — at least one button with its aria-label should exist
    const links = screen.getAllByRole('button', { name: /view source for acme corp/i })
    expect(links.length).toBeGreaterThan(0)
  })

  it('calls onCitationClick when citation link is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<ComparisonTable data={data} onCitationClick={onClick} />)
    // Citation p.42 appears in multiple rows; click the first one
    const links = screen.getAllByRole('button', { name: /view source for acme corp/i })
    await user.click(links[0])
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('displays currency information', () => {
    render(<ComparisonTable data={data} />)
    expect(screen.getByText('(INR)')).toBeInTheDocument()
    expect(screen.getByText('(USD)')).toBeInTheDocument()
  })

  it('renders disclaimer about currency differences', () => {
    render(<ComparisonTable data={data} />)
    expect(screen.getByText(/different reporting currencies/i)).toBeInTheDocument()
  })

  it('returns null when data is empty', () => {
    const { container } = render(<ComparisonTable data={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when data is undefined', () => {
    const { container } = render(<ComparisonTable data={null} />)
    expect(container.firstChild).toBeNull()
  })
})
