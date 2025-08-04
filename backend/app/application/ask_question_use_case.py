from app.domain.entities import Question, QueryResult
from app.infrastructure.openai_client import OpenAIClient
from app.infrastructure.db_repository import DBRepository

class AskQuestionUseCase:
    def __init__(self, openai_client: OpenAIClient, db_repo: DBRepository):
        self.openai_client = openai_client
        self.db_repo = db_repo

    async def execute(self, question: Question) -> QueryResult:
        schema = self.db_repo.get_schema_description()
        sql = await self.openai_client.question_to_sql(question.question, schema)        
        self.db_repo.validate_sql(sql)
        columns, rows = self.db_repo.execute_sql(sql)
        return QueryResult(columns, rows)

