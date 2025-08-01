import pytest
from app.domain.entities import Question
from app.application.ask_service import AskService

class DummyOpenAI:
    async def question_to_sql(self, question):
        return "SELECT 1 as a, 2 as b"

class DummyDB:
    def execute_sql(self, sql):
        return ["a", "b"], [[1, 2]]

def test_ask_service(monkeypatch):
    service = AskService(DummyOpenAI(), DummyDB())
    result = pytest.run(service.ask(Question("¿Cuántos registros hay?")))
    assert result.columns == ["a", "b"]
    assert result.rows == [[1, 2]]
