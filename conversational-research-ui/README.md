# FinResearch AI — Multi-Agent Financial Research System

> **Infosys Internship Project** · Milestone 3, Task 3  
> *Conversational Research Interface — cited, reasoned financial research at your fingertips.*

---

## Project Overview

**FinResearch AI** is a professional, full-featured conversational research frontend for a Multi-Agent Financial Research System. The platform enables users to ask natural-language financial questions about uploaded company annual reports, financial statements, and filings. Every answer is grounded in the uploaded documents and accompanied by source citations with page-level references.

The system is designed to integrate with multiple specialised backend AI agents (Research, Comparison, Document, and Report agents) through a clean REST API adapter layer.

---

## Assigned Module

**Milestone 3 · Task 3 — Conversational Research Interface**

| Item | Detail |
|------|--------|
| Module | Frontend — Conversational Chat UI |
| Milestone | Milestone 3 |
| Task | Task 3 — Develop Conversational Research Interface |
| Responsibility | End-to-end chat interface: question input → agent routing → cited response display |
| Integration points | Research Agent, Comparison Agent, Document Agent, Report Agent (via REST API) |

---

## Technology Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS 3 + vanilla CSS tokens |
| Icons | Lucide React |
| HTTP client | Axios |
| Markdown | react-markdown + remark-gfm + rehype-sanitize |
| Charts | Recharts (optional visualisations) |
| Testing | Vitest + React Testing Library + jsdom |
| Linting | Oxlint |

---

## Features

### Conversational Interface
- ChatGPT-style financial research chat
- Send with **Enter**, multiline with **Shift+Enter**
- Auto-resizing textarea
- Automatic scroll to newest message
- Message timestamps
- Copy responses to clipboard

### Session Management
- Create, switch, and delete research sessions
- Session names and previews in sidebar
- Persistent demo session history via `localStorage`

### Source Citations
- Every AI answer includes clickable source citations
- Each citation shows: company, document name, page number, and excerpt
- Click any citation to open a detailed **Source Panel** (slide-in)
- Source Panel shows full excerpt and optional PDF deep-link to exact page
- Duplicate citations are automatically deduplicated
- If the backend returns insufficient evidence, displays: *"Insufficient information in the uploaded documents…"*

### Agent Integration
- Displays the active agent (Research / Comparison / Document / Report) on each response
- Colour-coded agent badges
- Loading indicator shows which agent is thinking

### Company Comparison Table
- Renders structured comparison data from the Comparison Agent
- Displays: company, financial year, revenue, net profit, operating margin, debt
- Per-company currency and unit labels
- Clickable source citations per data cell
- Never invents missing values (displays **N/A**)
- Warning footer reminding reviewers that direct comparison requires normalisation

### Document Selector
- Browse all indexed documents
- Filter by company or search by name
- Select / deselect documents to scope queries
- Upload new documents (PDF, DOCX, XLSX) with progress indicator

### Design
- Dark navy sidebar, light/dark main content area
- Full **light / dark mode** (persisted in localStorage)
- Responsive layout (desktop / tablet / mobile)
- Smooth slide-in source panel
- Animated chat message entry
- Keyboard accessible (tab, enter, space)
- Empty state welcome screen with suggested questions

### Demo Mode
- Fully functional without a backend
- Clearly labelled **Demo Mode** banner
- Uses entirely fictional company names and illustrative figures
- Never presents mock data as real research

---

## Project Structure

```
src/
+-- components/
|   +-- AgentBadge.jsx          # Colour-coded agent label pill
|   +-- ChatInput.jsx           # Auto-resizing chat textarea + send button
|   +-- ChatMessage.jsx         # User + AI message bubbles with citations
|   +-- ChatWindow.jsx          # Message list, loading state, demo banner
|   +-- CitationCard.jsx        # Compact clickable source citation
|   +-- ComparisonTable.jsx     # Structured financial comparison table
|   +-- DocumentSelector.jsx    # Document browser, filter, upload
|   +-- LoadingIndicator.jsx    # Animated typing dots
|   +-- Sidebar.jsx             # Collapsible sidebar with sessions
|   +-- SourcePanel.jsx         # Slide-in full citation detail panel
|   +-- WelcomeScreen.jsx       # Empty-state hero with suggested questions
+-- data/
|   +-- demoData.js             # DEMO ONLY - Fictional responses & documents
+-- hooks/
|   +-- useResearchChat.js      # Core state: sessions, messages, API calls
+-- pages/
|   +-- ResearchWorkspace.jsx   # Top-level page composition
+-- services/
|   +-- api.js                  # Axios instance + centralized endpoints
|   +-- researchService.js      # Adapter layer (demo vs backend)
+-- tests/
|   +-- ChatMessage.test.jsx
|   +-- CitationCard.test.jsx
|   +-- ComparisonTable.test.jsx
|   +-- useResearchChat.test.js
|   +-- setup.js
+-- utils/
|   +-- citationUtils.js        # Citation formatting, dedup, PDF links
+-- App.jsx
+-- index.css                   # CSS tokens, chat bubbles, animations
+-- main.jsx
```

---

## Installation

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd finresearch-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your backend URL

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Base URL of the backend API |
| `VITE_DEMO_MODE` | `false` | Set to `true` to force Demo Mode |
| `VITE_API_TIMEOUT` | `30000` | Request timeout in milliseconds |

```env
# .env.local
VITE_API_BASE_URL=http://localhost:8000
VITE_DEMO_MODE=false
VITE_API_TIMEOUT=30000
```

> **Never commit `.env.local` to version control.** It is listed in `.gitignore`.

---

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode
npm run test:watch

# Interactive UI
npm run test:ui
```

### Test Coverage

| Test File | Tests |
|-----------|-------|
| `ChatMessage.test.jsx` | Render user/AI messages, citations, copy, retry, error state |
| `CitationCard.test.jsx` | Citation render, page number, excerpt, PDF link, click handler |
| `ComparisonTable.test.jsx` | Table render, N/A for missing data, source links |
| `useResearchChat.test.js` | Init, sendQuestion, loading state, error handling, session management |
| **Total** | **39 tests** |

---

## Demo Mode

Demo Mode activates when `VITE_DEMO_MODE=true`.

**To run in Demo Mode:**
```bash
# In .env.local
VITE_DEMO_MODE=true
```

Then run `npm run dev`.

Demo Mode features:
- Clearly displayed **Demo Mode** banner in the chat header
- Welcome screen shows the demo notice
- Sidebar shows the demo indicator
- Responses use **entirely fictional companies** (Acme Corp, Nexus Industries, Meridian Holdings)
- **All financial figures are illustrative and do not represent real data**
- Sessions persist in browser `localStorage`

---

## Backend Integration Contract

### Authentication
Attach a bearer token via `window.__AUTH_TOKEN__` or update the Axios interceptor in `src/services/api.js`.

### POST /api/research/query

**Request**
```json
{
  "session_id": "session-123",
  "question": "What is the revenue growth of Company A in FY2024?",
  "document_ids": ["doc-1", "doc-2"]
}
```

**Response**
```json
{
  "answer": "Revenue grew by X% based on the uploaded documents...",
  "agent": "research",
  "citations": [
    {
      "document_id": "doc-1",
      "document_name": "Annual Report FY2024.pdf",
      "company": "Company A",
      "page": 42,
      "excerpt": "Total revenue for FY2024 was...",
      "file_url": null
    }
  ],
  "comparison": null
}
```

For comparison queries, `comparison` is an array of rows:
```json
"comparison": [
  {
    "company": "Company A",
    "financial_year": "FY2024",
    "revenue": "INR 18,420 Cr",
    "net_profit": "INR 2,948 Cr",
    "operating_margin": "19.2%",
    "debt": "INR 3,210 Cr",
    "currency": "INR",
    "unit": "Crore",
    "citations": [{ "...citation object..." : "..." }]
  }
]
```

### Additional Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/research/sessions` | List research sessions |
| `POST` | `/api/research/sessions` | Create session |
| `DELETE` | `/api/research/sessions/:id` | Delete session |
| `GET` | `/api/documents` | List indexed documents |
| `POST` | `/api/documents/upload` | Upload document (multipart/form-data) |

**Adapter Pattern:** All endpoints are in `src/services/api.js`. All normalization is in `src/services/researchService.js`. When the backend contract changes, only update these two files.

---

## Future Integration Steps

1. **Connect Research Agent** — Set `VITE_API_BASE_URL` to the live backend
2. **Connect Comparison Agent** — Frontend already renders comparison tables when `comparison` is non-null
3. **Document Agent** — Wire document upload endpoint to the Document Agent's processing pipeline
4. **Report Agent** — Add a "Generate Report" action calling a report endpoint
5. **Authentication** — Implement JWT auth and set `window.__AUTH_TOKEN__` in the API interceptor
6. **WebSocket streaming** — Replace polling with streaming tokens for real-time response rendering
7. **Error telemetry** — Integrate Sentry or equivalent for production error tracking

---

## Build for Production

```bash
npm run build
# Output in dist/
```

Preview the production build:
```bash
npm run preview
```

---

## License

This project is submitted as part of an **Infosys internship assignment**. All demo financial data is entirely fictional and created for UI testing purposes only. It does not represent real financial research or investment advice.
