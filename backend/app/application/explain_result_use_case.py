from app.infrastructure.openai_client import OpenAIClient
from typing import List, Any, AsyncGenerator
import json

class ExplainResultUseCase:
    def __init__(self, openai_client: OpenAIClient):
        self.openai_client = openai_client

    async def execute(self, columns: List[str], rows: List[List[Any]]) -> AsyncGenerator[str, None]:
        if not columns or not rows:
            yield "No data to explain."
            return
        async for chunk in self.openai_client.stream_explanation(columns, rows):
            yield chunk
