from typing import Any

class QueryResult:
    def __init__(self, columns: list[str], rows: list[list[Any]]):
        self.columns = columns
        self.rows = rows

class Question:
    def __init__(self, text: str):
        self.text = text
