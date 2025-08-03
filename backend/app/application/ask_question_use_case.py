from app.domain.entities import Question, QueryResult
from app.infrastructure.openai_client import OpenAIClient
from app.infrastructure.db_repository import DBRepository
from app.infrastructure.sql_validator import is_safe_sql

class AskQuestionUseCase:
    def __init__(self, openai_client: OpenAIClient, db_repo: DBRepository):
        self.openai_client = openai_client
        self.db_repo = db_repo

    async def execute(self, question: Question) -> QueryResult:
        sql = await self.openai_client.question_to_sql(question.text)
        if not is_safe_sql(sql):
            raise ValueError("Potentially unsafe SQL query")
        columns, rows = self.db_repo.execute_sql(sql)
        return QueryResult(columns, rows)
