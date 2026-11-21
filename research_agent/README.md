# Research Agent

The Research Agent answers financial questions using only chunks already indexed in the project's `finsight_documents` ChromaDB collection.

## Flow

1. Gemini decomposes the question into a small set of retrieval queries.
2. The agent embeds each query with the same ONNX embedding function used by the Document Agent.
3. ChromaDB returns relevant chunks. Duplicate chunks are removed and an optional company filter is applied.
4. Gemini synthesizes an answer from the retrieved passages only.
5. The agent accepts only citation markers that map to retrieved chunks and returns filename + chunk ID citations.

## API

`POST /api/research/query`

```json
{
  "question": "What does the annual report say about revenue and operating costs?",
  "company": null
}
```

The response contains `answer`, `citations`, `sub_queries`, `evidence_count`, and `limitations`.

## Citation limitation

The current Document Agent stores source filename, chunk ID, and text, but does not retain PDF page numbers. Therefore this agent cites filename and chunk ID and intentionally returns `page: null` rather than inventing page numbers.

## Configuration

Set `GEMINI_API_KEY` in the project-root `.env`. The default model is `gemini-3.5-flash`, matching the existing Extraction Agent. Override it with `GEMINI_MODEL` if the project uses a different model available to its API key.
