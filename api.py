
import tempfile
from fastapi.responses import FileResponse
from report_agent.orchestrator import FinancialResearchOrchestrator
from contextlib import asynccontextmanager
from pathlib import Path
import sys
import uuid

import chromadb
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR / "document_agent"))

from search_documents import load_search_engine
from document_agent.index_uploaded_document import index_pdf

UPLOAD_DIR = BASE_DIR / "uploaded_documents"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

DB_DIR = BASE_DIR / "vector_db"
COLLECTION_NAME = "finsight_documents"
MAX_UPLOAD_BYTES = 20 * 1024 * 1024

engine = {}
report_orchestrator = FinancialResearchOrchestrator()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading Finsight AI search engine...")
    (
        engine["embeddings"],
        engine["metadata"],
        engine["tokenizer"],
        engine["session"],
        engine["input_names"],
    ) = load_search_engine()

    engine["chroma"] = chromadb.PersistentClient(path=str(DB_DIR))
    engine["collection"] = engine["chroma"].get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    print("Finsight AI search engine ready!")
    print("Indexed chunks:", engine["collection"].count())
    yield
    engine.clear()


app = FastAPI(
    title="Finsight AI Document Search API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from red_flag_agent.router import router as red_flag_router
app.include_router(red_flag_router)


class SearchRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1000)
    company: str | None = None


def embed_query(question):
    tokenizer = engine["tokenizer"]
    encoded = tokenizer.encode(question)

    input_ids = np.array([encoded.ids], dtype=np.int64)
    attention_mask = np.array(
        [encoded.attention_mask], dtype=np.int64
    )
    token_type_ids = np.array(
        [encoded.type_ids], dtype=np.int64
    )

    inputs = {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
    }

    if "token_type_ids" in engine["input_names"]:
        inputs["token_type_ids"] = token_type_ids

    output = engine["session"].run(None, inputs)[0]
    mask = attention_mask[..., None].astype(np.float32)

    pooled = (output * mask).sum(axis=1)
    pooled /= np.maximum(mask.sum(axis=1), 1e-9)

    norms = np.linalg.norm(pooled, axis=1, keepdims=True)
    vector = pooled / np.maximum(norms, 1e-12)

    return vector[0].astype(np.float32).tolist()


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "Finsight AI Document Agent",
        "indexed_chunks": engine["collection"].count()
        if "collection" in engine else 0,
    }


@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename or Path(file.filename).suffix.lower() != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file.",
        )

    contents = await file.read()

    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail="PDF must be smaller than 20 MB.",
        )

    if not contents.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid PDF.",
        )

    saved_name = f"{uuid.uuid4().hex}.pdf"
    destination = UPLOAD_DIR / saved_name
    destination.write_bytes(contents)

    try:
        result = index_pdf(destination, saved_name, file.filename)

        return {
            "message": "PDF uploaded and indexed successfully.",
            "filename": file.filename,
            "document_id": saved_name,
            "size_bytes": len(contents),
            "indexed": True,
            "chunks_indexed": result["chunks_indexed"],
            "source": result["source"],
            "total_indexed_chunks": engine["collection"].count(),
        }

    except Exception as exc:
        destination.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail=f"PDF indexing failed: {exc}",
        ) from exc


@app.post("/api/search")
def search(request: SearchRequest):
    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Please enter a question.",
        )

    company = (request.company or "").strip() or None

    if company and company.lower() not in {"amazon", "apple"}:
        raise HTTPException(
            status_code=400,
            detail="Choose Amazon, Apple, or All companies.",
        )

    try:
        collection = engine["collection"]
        total = collection.count()

        if total == 0:
            return {
                "question": question,
                "company": company or "All companies",
                "count": 0,
                "results": [],
            }

        query_vector = embed_query(question)

        # Fetch a wider set so company filtering has a chance
        # to return relevant matches from the selected company.
        response = collection.query(
            query_embeddings=[query_vector],
            n_results=min(total, 100),
            include=["documents", "metadatas", "distances"],
        )

        results = []

        documents = response["documents"][0]
        metadatas = response["metadatas"][0]
        distances = response["distances"][0]

        for text, metadata, distance in zip(
            documents, metadatas, distances
        ):
            source = metadata.get("source", "")
            filename = metadata.get("filename", source)

            if company and company.lower() not in (
                source + " " + filename
            ).lower():
                continue

            results.append({
                "source": filename,
                "chunk_id": metadata.get("chunk_id", ""),
                "score": round(1 - float(distance), 4),
                "text": text,
            })

            if len(results) >= 5:
                break

        return {
            "question": question,
            "company": company or "All companies",
            "count": len(results),
            "results": results,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {exc}",
        ) from exc

@app.post("/api/reports/generate")
async def generate_financial_report(
    file: UploadFile = File(...),
    company_name: str | None = None
):
    if not file.filename or Path(file.filename).suffix.lower() != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file."
        )

    contents = await file.read()

    if not contents.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file."
        )

    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail="PDF must be smaller than 20 MB."
        )

    temporary_path = None

    try:
        with tempfile.NamedTemporaryFile(
            suffix=".pdf",
            delete=False
        ) as temporary_file:
            temporary_file.write(contents)
            temporary_path = Path(temporary_file.name)

        result = report_orchestrator.analyze_document(
            pdf_path=temporary_path,
            company_name=company_name
        )

        return FileResponse(
            path=result["pdf_path"],
            media_type="application/pdf",
            filename=f"{Path(file.filename).stem}_financial_report.pdf"
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Report generation failed: {exc}"
        ) from exc

    finally:
        if temporary_path:
            temporary_path.unlink(missing_ok=True)
