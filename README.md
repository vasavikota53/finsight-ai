# Finsight AI

AI-powered financial research and document analysis platform.

## Project Overview

Finsight AI aims to help users analyze financial documents, retrieve relevant information, identify potential red flags, compare companies, and generate research reports.

## Current Implementation

- **Document Agent:** PDF text extraction, chunking, embedding generation, and vector database indexing.
- **Backend:** FastAPI application for document processing and search.
- **Frontend:** React and Vite application.

## Technology Stack

- Frontend: React, Vite, JavaScript
- Backend: Python, FastAPI
- PDF processing: pypdf
- Embeddings: ONNX Runtime and tokenizers
- Vector database: ChromaDB

## Backend Setup

From the project root, create a virtual environment and install the dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Start the API:

```powershell
.\.venv\Scripts\python.exe -m uvicorn api:app --reload
```

Default local API address: http://127.0.0.1:8000

## Frontend Setup

Open another terminal:

```powershell
cd finsight-ai
npm.cmd install
npm.cmd run dev
```

Open the local address printed by Vite.

## Development Notes

- Generated embeddings, vector databases, downloaded model files, and extracted documents are excluded from Git.
- Seed financial reports should only be shared if their redistribution permissions allow it.
- Additional agents and multi-agent orchestration are planned as development progresses.

## Team Contributions

Update this section as team members and responsibilities are assigned.
