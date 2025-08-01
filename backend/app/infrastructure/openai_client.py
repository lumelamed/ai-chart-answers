import os
import openai
import backoff

class OpenAIClient:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")

    @backoff.on_exception(backoff.expo, (openai.error.RateLimitError, openai.error.ServiceUnavailableError), max_tries=5)
    async def question_to_sql(self, question: str) -> str:
        prompt = f"Traduce la siguiente pregunta a una consulta SQL válida para la base de datos: '{question}'"
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
        )
        sql = response.choices[0].message.content.strip()
        return sql
