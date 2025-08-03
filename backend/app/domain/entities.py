from pydantic import BaseModel

class Question(BaseModel):
    question: str

class QueryResult:
    def __init__(self, columns: list[str], rows: list[list[Any]]):
        self.columns = columns
        self.rows = rows
