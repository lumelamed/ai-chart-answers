from app.domain.entities import Question, QueryResult
from app.application.ask_question_use_case import AskQuestionUseCase
from app.application.load_csv_use_case import LoadCSVUseCase

class AskService:
    def __init__(self, openai_client, db_repo):
        self.ask_question_use_case = AskQuestionUseCase(openai_client, db_repo)
        self.load_csv_use_case = LoadCSVUseCase(db_repo)

    async def ask(self, question: Question) -> QueryResult:
        return await self.ask_question_use_case.execute(question)

    def load_csv(self, csv_path: str, table_name: str = "data"):
        return self.load_csv_use_case.execute(csv_path, table_name)
