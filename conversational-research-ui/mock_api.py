
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FinSight Mock Research API")

# Allow React frontend running on ports 5173 and 5174
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "message": "FinSight Mock API is running"
    }

@app.post("/api/search")
def search(request: dict):
    question = request.get("question", "")

    return {
        "question": question,
        "company": "All companies",
        "count": 1,
        "results": [
            {
                "source": "Sample_Financial_Report.pdf",
                "chunk_id": "test-001",
                "score": 0.95,
                "text": (
                    "This is a MOCK PDF search result used to "
                    "verify the conversational interface. "
                    "It is not extracted from a real financial report. "
                    f"Your question was: {question}"
                ),
            }
        ],
    }
