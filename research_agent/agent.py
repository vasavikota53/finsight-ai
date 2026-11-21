"""Multi-step financial research grounded in the existing Chroma collection."""

from __future__ import annotations

import json
import re
from typing import Any, Callable

from .prompts import ANSWER_PROMPT, PLANNING_PROMPT


class ResearchAgent:
    """Plans retrieval, gathers evidence, and generates cited answers.

    The agent deliberately receives the existing Chroma collection and query
    embedding function. It does not create a second vector database or re-index
    documents.
    """

    def __init__(
        self,
        collection: Any,
        embed_query: Callable[[str], list[float]],
        client: Any,
        model_name: str = "gemini-3.5-flash",
        retrieval_per_query: int = 6,
        max_evidence: int = 12,
    ) -> None:
        self.collection = collection
        self.embed_query = embed_query
        self.client = client
        self.model_name = model_name
        self.retrieval_per_query = retrieval_per_query
        self.max_evidence = max_evidence

    @staticmethod
    def _generation_config(temperature: float) -> Any:
        # The real API uses the Google SDK config object. The dict fallback
        # keeps retrieval/citation unit tests independent of SDK installation.
        try:
            from google.genai import types
            return types.GenerateContentConfig(
                temperature=temperature,
                response_mime_type="application/json",
            )
        except ImportError:
            return {"temperature": temperature, "response_mime_type": "application/json"}

    @staticmethod
    def _json_from_response(response: Any) -> dict:
        raw = getattr(response, "text", None)
        if not raw:
            raise ValueError("The language model returned an empty response.")
        raw = raw.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.I)
        try:
            value = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ValueError("The language model returned invalid JSON.") from exc
        if not isinstance(value, dict):
            raise ValueError("The language model response must be a JSON object.")
        return value

    def _plan_queries(self, question: str) -> list[str]:
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=PLANNING_PROMPT.format(question=question),
            config=self._generation_config(0),
        )
        parsed = self._json_from_response(response)
        queries = parsed.get("queries", [])
        if not isinstance(queries, list):
            queries = []
        clean = []
        for query in [question, *queries]:
            if isinstance(query, str) and query.strip():
                normalized = query.strip()
                if normalized.casefold() not in {item.casefold() for item in clean}:
                    clean.append(normalized)
            if len(clean) == 4:
                break
        return clean or [question]

    @staticmethod
    def _matches_company(metadata: dict, company: str | None) -> bool:
        if not company:
            return True
        searchable = " ".join(
            str(metadata.get(key, ""))
            for key in ("company", "source", "filename")
        ).casefold()
        return company.casefold() in searchable

    def _retrieve(self, queries: list[str], company: str | None) -> list[dict]:
        total = self.collection.count()
        if total == 0:
            return []

        by_id: dict[str, dict] = {}
        for query in queries:
            result = self.collection.query(
                query_embeddings=[self.embed_query(query)],
                n_results=min(total, self.retrieval_per_query),
                include=["documents", "metadatas", "distances"],
            )
            ids = (result.get("ids") or [[]])[0]
            documents = (result.get("documents") or [[]])[0]
            metadatas = (result.get("metadatas") or [[]])[0]
            distances = (result.get("distances") or [[]])[0]

            for item_id, text, metadata, distance in zip(
                ids, documents, metadatas, distances
            ):
                metadata = metadata or {}
                if not text or not self._matches_company(metadata, company):
                    continue
                similarity = 1.0 - float(distance)
                current = by_id.get(str(item_id))
                if current is None or similarity > current["similarity"]:
                    by_id[str(item_id)] = {
                        "id": str(item_id),
                        "source": str(metadata.get("source") or metadata.get("filename") or "Unknown document"),
                        "filename": str(metadata.get("filename") or metadata.get("source") or "Unknown document"),
                        "chunk_id": str(metadata.get("chunk_id") or item_id),
                        "text": str(text),
                        "similarity": similarity,
                    }

        ranked = sorted(by_id.values(), key=lambda item: item["similarity"], reverse=True)
        return ranked[: self.max_evidence]

    def answer(self, question: str, company: str | None = None) -> dict:
        question = question.strip()
        if not question:
            raise ValueError("Please enter a research question.")

        queries = self._plan_queries(question)
        evidence_items = self._retrieve(queries, company)

        if not evidence_items:
            return {
                "answer": "Insufficient information: the indexed financial documents do not contain enough relevant evidence to answer this question.",
                "agent": "research",
                "citations": [],
                "sub_queries": queries,
                "evidence_count": 0,
                "limitations": ["No relevant indexed document chunks were retrieved."],
            }

        sources = []
        evidence_blocks = []
        for index, item in enumerate(evidence_items, start=1):
            source_id = f"S{index}"
            sources.append({
                "source_id": source_id,
                "document_id": item["id"],
                "document_name": item["filename"],
                "source": item["source"],
                "chunk_id": item["chunk_id"],
                "excerpt": item["text"],
                "similarity": round(item["similarity"], 4),
                "page": None,
                "file_url": None,
            })
            evidence_blocks.append(
                f"[{source_id}] Document: {item['filename']} | "
                f"Source: {item['source']} | Chunk: {item['chunk_id']}\n"
                f"Content:\n{item['text']}"
            )

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=ANSWER_PROMPT.format(
                question=question,
                evidence="\n\n---\n\n".join(evidence_blocks),
            ),
            config=self._generation_config(0.1),
        )
        parsed = self._json_from_response(response)
        answer = parsed.get("answer")
        if not isinstance(answer, str) or not answer.strip():
            raise ValueError("The Research Agent did not return an answer.")

        # Only expose citations that the answer actually references.
        used_ids = set(re.findall(r"\[(S\d+)\]", answer))
        valid_ids = {item["source_id"] for item in sources}
        unknown_ids = used_ids - valid_ids
        if unknown_ids:
            raise ValueError(
                "The generated answer referenced source IDs that were not retrieved; "
                "the response was rejected to protect citation accuracy."
            )

        citations = [item for item in sources if item["source_id"] in used_ids]
        if not citations:
            # Do not return a factual synthesis that has no traceable citation.
            answer = (
                "The retrieved passages were not sufficient to produce a "
                "verifiably cited answer. Please narrow the question or index "
                "the relevant filing."
            )

        limitations = parsed.get("limitations", [])
        if not isinstance(limitations, list):
            limitations = []

        return {
            "answer": answer,
            "agent": "research",
            "citations": citations,
            "sub_queries": queries,
            "evidence_count": len(evidence_items),
            "limitations": [str(item) for item in limitations if item],
        }
