"""Small deterministic tests for retrieval and citation safeguards."""

import unittest

from research_agent.agent import ResearchAgent


class FakeCollection:
    def count(self):
        return 2

    def query(self, query_embeddings, n_results, include):
        return {
            "ids": [["doc-a-chunk-1", "doc-b-chunk-2"]],
            "documents": [["Revenue was $100 million.", "Operating costs were $70 million."]],
            "metadatas": [[
                {"source": "annual_report.pdf", "filename": "annual_report.pdf", "chunk_id": "1", "company": "Acme"},
                {"source": "annual_report.pdf", "filename": "annual_report.pdf", "chunk_id": "2", "company": "Acme"},
            ]],
            "distances": [[0.1, 0.2]],
        }


class FakeClient:
    def __init__(self, responses):
        self.responses = iter(responses)
        self.models = self

    def generate_content(self, **kwargs):
        class Response:
            def __init__(self, text):
                self.text = text
        return Response(next(self.responses))


class ResearchAgentTests(unittest.TestCase):
    def test_retrieval_deduplicates_and_filters_company(self):
        client = FakeClient(['{"queries": ["revenue"]}'])
        agent = ResearchAgent(FakeCollection(), lambda q: [0.1], client)
        queries = agent._plan_queries("What was revenue?")
        results = agent._retrieve(queries, "Acme")
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["chunk_id"], "1")

    def test_answer_returns_only_cited_sources(self):
        client = FakeClient([
            '{"queries": ["revenue"]}',
            '{"answer": "Revenue was $100 million [S1].", "limitations": []}',
        ])
        agent = ResearchAgent(FakeCollection(), lambda q: [0.1], client)
        result = agent.answer("What was revenue?", "Acme")
        self.assertIn("[S1]", result["answer"])
        self.assertEqual(len(result["citations"]), 1)
        self.assertEqual(result["citations"][0]["chunk_id"], "1")

    def test_unknown_citation_is_rejected(self):
        client = FakeClient([
            '{"queries": ["revenue"]}',
            '{"answer": "Revenue was $100 million [S99].", "limitations": []}',
        ])
        agent = ResearchAgent(FakeCollection(), lambda q: [0.1], client)
        with self.assertRaisesRegex(ValueError, "source IDs"):
            agent.answer("What was revenue?", "Acme")


if __name__ == "__main__":
    unittest.main()
