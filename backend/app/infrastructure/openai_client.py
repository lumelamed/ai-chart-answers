import os
import traceback
from app.infrastructure.sql_helper import clean_sql_output
import backoff
from openai import AsyncOpenAI, OpenAIError
import logging

logger = logging.getLogger(__name__)


class OpenAIClient:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.warning("⚠️ OPENAI_API_KEY is not configured.")
        self.client = AsyncOpenAI(api_key=api_key)

    @backoff.on_exception(
        backoff.expo,
        (OpenAIError),
        max_tries=3,
        jitter=backoff.full_jitter,
        on_backoff=lambda details: logger.warning(
            f"Retrying OpenAI (try {details['tries']}) due to: {details['exception']}"
        )
    )
    async def question_to_sql(self, question: str, schema: str) -> str:
        prompt = self.build_prompt(question, schema)

        try:
            response = await self.client.responses.create(
                model="gpt-4o",
                instructions="Answer clearly and helpfully.",
                input=prompt,
            )
            sql_raw = response.output_text
            logger.info(f"✅ OpenAI replied: {sql_raw}")
            sql = clean_sql_output(sql_raw)
            return sql

        except (OpenAIError) as e:
            logger.error(f"❌ OpenAI error: {type(e).__name__} - {e}")
            raise

        except Exception as e:
            logger.error("❌ Unexpected error when calling OpenAI:")
            logger.error(traceback.format_exc())
            raise Exception("Unexpected failure when communicating with OpenAI") from e
    
    @staticmethod
    def build_prompt(question: str, schema: str) -> str:
        return (
            "You are a helpful assistant that converts natural language into SQL for a SQLite database.\n"
            "Only output the SQL query, without explanation or preamble.\n"
            f"The database schema is as follows:\n{schema}\n\n"
            f"Question: {question}"
        )

    @backoff.on_exception(
        backoff.expo,
        (OpenAIError),
        max_tries=3,
        jitter=backoff.full_jitter,
        on_backoff=lambda details: logger.warning(
            f"Retrying OpenAI (stream_explanation, try {details['tries']}) due to: {details['exception']}"
        )
    )
    async def stream_explanation(self, columns, rows):
        import json
        prompt = (
            "Given the following SQL result, describe it in natural language for a business user. "
            "Columns: " + json.dumps(columns) + ", Rows: " + json.dumps(rows) + ". "
            "Be concise and clear."
        )
        try:
            stream = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                stream=True,
            )
            async for chunk in stream:
                content = chunk.choices[0].delta.content if chunk.choices[0].delta else ""
                if content:
                    yield content
        except (OpenAIError) as e:
            logger.error(f"❌ OpenAI error (stream_explanation): {type(e).__name__} - {e}")
            yield f"[OpenAI error: {type(e).__name__} - {e}]"
        except Exception as e:
            logger.error("❌ Unexpected error when calling OpenAI (stream_explanation):")
            logger.error(traceback.format_exc())
            yield f"[Unexpected error: {str(e)}]"
