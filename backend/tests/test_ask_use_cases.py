import pytest
from app.domain.entities import Question
from app.application.ask_question_use_case import AskQuestionUseCase
from app.application.load_csv_use_case import LoadCSVUseCase
from app.application.explain_result_use_case import ExplainResultUseCase

class DummyOpenAI:
    async def question_to_sql(self, question):
        return "SELECT 1 as a, 2 as b"

    async def stream_explanation(self, columns, rows):
        yield "This is a test explanation."

class DummyDB:
    def execute_sql(self, sql):
        return ["a", "b"], [[1, 2]]

    def load_csv(self, csv_path, table_name="data"):
        return "CSV loaded"

@pytest.mark.asyncio
async def test_ask_question_use_case():
    use_case = AskQuestionUseCase(DummyOpenAI(), DummyDB())
    result = await use_case.execute(Question(question="How many records are there?"))
    assert result.columns == ["a", "b"]
    assert result.rows == [[1, 2]]

def test_load_csv_use_case():
    use_case = LoadCSVUseCase(DummyDB())
    result = use_case.execute("dummy_path.csv")
    assert result == "CSV loaded"

@pytest.mark.asyncio
async def test_explain_result_use_case():
    use_case = ExplainResultUseCase(DummyOpenAI())
    gen = use_case.execute(["a", "b"], [[1, 2]])
    explanation = []
    async for chunk in gen:
        explanation.append(chunk)
    assert "test explanation" in "".join(explanation)