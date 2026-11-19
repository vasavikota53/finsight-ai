/**
 * demoData.js
 *
 * ⚠️  DEMO DATA ONLY — All companies, figures, and citations below are
 *     entirely fictional and are provided for UI testing purposes only.
 *     They do NOT represent real financial research findings.
 */

// ─────────────────────────────────────────────────────────────
//  Demo Sessions
// ─────────────────────────────────────────────────────────────
export const DEMO_SESSIONS = [
  {
    id: 'demo-session-1',
    name: 'Acme Corp Revenue Analysis',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    preview: 'What was the revenue growth of Acme Corp in FY2024?',
  },
  {
    id: 'demo-session-2',
    name: 'Nexus vs Acme Comparison',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    preview: 'Compare operating margins of Nexus Industries and Acme Corp.',
  },
  {
    id: 'demo-session-3',
    name: 'Meridian Risk Assessment',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    preview: 'What financial risks were identified in the annual report?',
  },
]

// ─────────────────────────────────────────────────────────────
//  Demo Documents
// ─────────────────────────────────────────────────────────────
export const DEMO_DOCUMENTS = [
  {
    id: 'demo-doc-1',
    name: 'Acme Corp Annual Report FY2024.pdf',
    company: 'Acme Corp',
    pages: 148,
    status: 'indexed',
    uploaded_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    file_url: null,
  },
  {
    id: 'demo-doc-2',
    name: 'Nexus Industries 10-K FY2024.pdf',
    company: 'Nexus Industries',
    pages: 212,
    status: 'indexed',
    uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    file_url: null,
  },
  {
    id: 'demo-doc-3',
    name: 'Meridian Holdings Financial Statements FY2023.pdf',
    company: 'Meridian Holdings',
    pages: 94,
    status: 'indexed',
    uploaded_at: new Date(Date.now() - 86400000).toISOString(),
    file_url: null,
  },
  {
    id: 'demo-doc-4',
    name: 'Acme Corp Q3 2024 Earnings Release.pdf',
    company: 'Acme Corp',
    pages: 32,
    status: 'processing',
    uploaded_at: new Date(Date.now() - 1800000).toISOString(),
    file_url: null,
  },
]

// ─────────────────────────────────────────────────────────────
//  Reusable Citation Fixtures
// ─────────────────────────────────────────────────────────────
const ACME_CITATION_1 = {
  document_id:   'demo-doc-1',
  document_name: 'Acme Corp Annual Report FY2024.pdf',
  company:       'Acme Corp',
  page:          42,
  excerpt:       '"Total revenue for FY2024 was ₹18,420 crore, representing a 23.4% increase compared to ₹14,924 crore in FY2023, driven primarily by expansion in cloud services and digital transformation contracts." — Management Discussion & Analysis, p. 42',
  file_url:      null,
}
const ACME_CITATION_2 = {
  document_id:   'demo-doc-1',
  document_name: 'Acme Corp Annual Report FY2024.pdf',
  company:       'Acme Corp',
  page:          67,
  excerpt:       '"Operating margin improved to 19.2% in FY2024, up from 16.8% in FY2023, reflecting operational efficiency gains and favorable product mix." — Financial Highlights, p. 67',
  file_url:      null,
}
const NEXUS_CITATION_1 = {
  document_id:   'demo-doc-2',
  document_name: 'Nexus Industries 10-K FY2024.pdf',
  company:       'Nexus Industries',
  page:          38,
  excerpt:       '"Revenue for FY2024 totalled USD 4.2 billion, a 11.7% year-over-year increase from USD 3.76 billion in FY2023. Growth was led by the North American infrastructure segment." — 10-K Annual Report, p. 38',
  file_url:      null,
}
const NEXUS_CITATION_2 = {
  document_id:   'demo-doc-2',
  document_name: 'Nexus Industries 10-K FY2024.pdf',
  company:       'Nexus Industries',
  page:          55,
  excerpt:       '"Operating margin for the year was 14.6%, compared to 15.1% the prior year, reflecting increased R&D investment and supply chain headwinds." — 10-K Annual Report, p. 55',
  file_url:      null,
}
const MERIDIAN_CITATION_1 = {
  document_id:   'demo-doc-3',
  document_name: 'Meridian Holdings Financial Statements FY2023.pdf',
  company:       'Meridian Holdings',
  page:          19,
  excerpt:       '"The Group identifies concentration of credit risk in its top three customers, who collectively accounted for 48% of total revenue, as a material risk factor." — Notes to Financial Statements, p. 19',
  file_url:      null,
}

// ─────────────────────────────────────────────────────────────
//  Demo Responses
// ─────────────────────────────────────────────────────────────
export const DEMO_RESPONSES = {
  revenue: {
    answer: `## Revenue Growth — Acme Corp FY2024\n\nBased on the uploaded annual report, **Acme Corp recorded total revenue of ₹18,420 crore in FY2024**, representing a **23.4% year-over-year increase** compared to ₹14,924 crore in FY2023.\n\n### Key Growth Drivers\n- **Cloud services expansion** — 34% segment growth YoY\n- **Digital transformation contracts** — new large enterprise wins\n- **Geographic diversification** — increased international revenue contribution\n\n> *All figures sourced directly from the uploaded Acme Corp Annual Report FY2024.*`,
    agent:  'research',
    citations: [ACME_CITATION_1],
    comparison: null,
  },

  margin: {
    answer: `## Operating Margin Analysis\n\nAcme Corp's **operating margin improved to 19.2% in FY2024** (up from 16.8% in FY2023), reflecting strong cost discipline and favorable product mix.\n\n| Metric            | FY2024  | FY2023  | Change   |\n|-------------------|---------|---------|----------|\n| Operating Margin  | 19.2%   | 16.8%   | +240 bps |\n| EBITDA Margin     | 24.1%   | 21.3%   | +280 bps |\n\n*Source: Acme Corp Annual Report FY2024, Financial Highlights section.*`,
    agent:  'research',
    citations: [ACME_CITATION_2],
    comparison: null,
  },

  comparison: {
    answer: `## Comparative Financial Analysis — Acme Corp vs. Nexus Industries (FY2024)\n\nThe Comparison Agent has analyzed financial metrics from both companies' uploaded documents. Key observations:\n\n- **Acme Corp** shows stronger revenue growth (23.4% vs 11.7%) but operates in different currency and scale.\n- **Nexus Industries** had a slight margin compression in FY2024 due to R&D investments.\n- Direct comparison should account for differences in reporting currency (INR vs USD) and industry segment mix.\n\n*Note: All figures sourced from uploaded documents. Missing values indicate the data was not found in the provided filings.*`,
    agent:  'comparison',
    citations: [ACME_CITATION_1, NEXUS_CITATION_1, ACME_CITATION_2, NEXUS_CITATION_2],
    comparison: [
      {
        company:          'Acme Corp',
        financial_year:   'FY2024',
        revenue:          '₹18,420 Cr',
        net_profit:       '₹2,948 Cr',
        operating_margin: '19.2%',
        debt:             '₹3,210 Cr',
        currency:         'INR',
        unit:             'Crore',
        citations:        [ACME_CITATION_1],
      },
      {
        company:          'Nexus Industries',
        financial_year:   'FY2024',
        revenue:          'USD 4.2 Bn',
        net_profit:       'USD 487 Mn',
        operating_margin: '14.6%',
        debt:             'USD 1.1 Bn',
        currency:         'USD',
        unit:             'Billion',
        citations:        [NEXUS_CITATION_1],
      },
    ],
  },

  risks: {
    answer: `## Financial Risk Assessment — Meridian Holdings FY2023\n\nThe Research Agent identified the following key financial risks from the uploaded financial statements:\n\n### 1. Customer Concentration Risk 🔴 High\nThe top three customers accounted for **48% of total revenue**, creating significant dependency and revenue volatility risk.\n\n### 2. Currency Exposure Risk 🟡 Medium\nApproximately 31% of revenue is denominated in USD while cost base is predominantly domestic, creating exchange rate sensitivity.\n\n### 3. Liquidity Risk 🟡 Medium\nCurrent ratio of 1.18x is below the industry benchmark of 1.5x, suggesting potential near-term liquidity pressure.\n\n> *Risk classifications are based solely on disclosures in the uploaded filing. This is not investment advice.*`,
    agent:  'research',
    citations: [MERIDIAN_CITATION_1],
    comparison: null,
  },

  debt: {
    answer: `## Debt Position Analysis — Acme Corp (3-Year Trend)\n\nBased on historical filings available in the uploaded documents:\n\n| Financial Year | Total Debt    | Debt/Equity | Net Debt  |\n|----------------|---------------|-------------|----------|\n| FY2022         | ₹2,840 Cr     | 0.42x       | ₹1,920 Cr |\n| FY2023         | ₹3,015 Cr     | 0.38x       | ₹1,840 Cr |\n| FY2024         | ₹3,210 Cr     | 0.34x       | ₹1,610 Cr |\n\n**Key observation**: While absolute debt has increased slightly (+13% over 3 years), the **debt-to-equity ratio has improved** from 0.42x to 0.34x, indicating stronger equity growth.\n\n*Source: Acme Corp Annual Report FY2024 — multi-year financial summary.*`,
    agent:  'research',
    citations: [ACME_CITATION_1],
    comparison: null,
  },

  summary: {
    answer: `## Financial Performance Summary — Acme Corp FY2024\n\nAcme Corp delivered a **strong financial performance in FY2024**, characterized by accelerating revenue growth, margin expansion, and improving balance sheet metrics.\n\n### Headline Metrics\n| Metric          | FY2024       | FY2023       | Growth    |\n|-----------------|--------------|--------------|----------|\n| Revenue         | ₹18,420 Cr   | ₹14,924 Cr   | +23.4%    |\n| Operating Profit| ₹3,537 Cr    | ₹2,507 Cr    | +41.1%    |\n| Net Profit      | ₹2,948 Cr    | ₹2,064 Cr    | +42.8%    |\n| EPS             | ₹47.2        | ₹33.1        | +42.6%    |\n\n### Strategic Highlights\n- Completed acquisition of DataFlow Technologies in Q2 FY2024\n- Expanded headcount by 8,400 net new employees\n- Received 3 new large-deal wins exceeding ₹500 Cr each\n\n> *Summary based on uploaded Annual Report. Full financial statements available in the source documents.*`,
    agent:  'research',
    citations: [ACME_CITATION_1, ACME_CITATION_2],
    comparison: null,
  },

  generic: {
    answer: `## Research Response\n\nI have analyzed the uploaded financial documents for relevant information regarding your query.\n\nBased on the available documents:\n- **Acme Corp FY2024** annual report has been indexed and is available for analysis\n- **Nexus Industries FY2024** 10-K is available\n- **Meridian Holdings FY2023** financial statements are indexed\n\nTo get a more precise answer, consider:\n1. Specifying the company name in your question\n2. Specifying the financial year\n3. Selecting relevant documents from the Document Selector panel\n\nYou can try questions like:\n- *"What was Acme Corp's revenue growth in FY2024?"*\n- *"Compare operating margins of Acme Corp and Nexus Industries"*\n- *"What financial risks did Meridian Holdings disclose?"*`,
    agent:  'research',
    citations: [],
    comparison: null,
  },
}

// ─────────────────────────────────────────────────────────────
//  Suggested Questions (Welcome Screen)
// ─────────────────────────────────────────────────────────────
export const SUGGESTED_QUESTIONS = [
  {
    id: 'sq-1',
    icon: '📈',
    label: 'Revenue Growth',
    text:  'What was the revenue growth of Acme Corp in FY2024?',
  },
  {
    id: 'sq-2',
    icon: '⚖️',
    label: 'Company Comparison',
    text:  'Compare the operating margins of Acme Corp and Nexus Industries.',
  },
  {
    id: 'sq-3',
    icon: '⚠️',
    label: 'Risk Analysis',
    text:  'What financial risks were identified in Meridian Holdings annual report?',
  },
  {
    id: 'sq-4',
    icon: '📊',
    label: 'Performance Summary',
    text:  "Summarize Acme Corp's financial performance for FY2024.",
  },
  {
    id: 'sq-5',
    icon: '💳',
    label: 'Debt Trends',
    text:  "How has Acme Corp's debt changed over the last three years?",
  },
  {
    id: 'sq-6',
    icon: '💰',
    label: 'Profit Margins',
    text:  "What is Nexus Industries' net profit margin trend?",
  },
]
