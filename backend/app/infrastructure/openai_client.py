import os
import logging
import traceback
import backoff
from openai import AsyncOpenAI, RateLimitError, APIError, Timeout

logger = logging.getLogger(__name__)

class OpenAIClient:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.warning("⚠️ OPENAI_API_KEY is not configured.")
        self.client = AsyncOpenAI(api_key=api_key)

    @backoff.on_exception(
        backoff.expo,
        (RateLimitError, APIError, Timeout),
        max_tries=3,
        jitter=backoff.full_jitter,
        on_backoff=lambda details: logger.warning(
            f"Retrying OpenAI (try {details['tries']}) due to: {details['exception']}"
        )
    )
    async def question_to_sql(self, question: str) -> str:
        prompt = f"Translate the following question into a valid SQL query for the database: '{question}'"

        try:
            response = await self.client.responses.create(
                model="gpt-4o",
                instructions="Answer clearly and helpfully.",
                input=prompt,
            )
            sql = response.output_text
            logger.debug(f"✅ OpenAI replied: {sql}")
            return sql

        except (RateLimitError, APIError, Timeout) as e:
            logger.error(f"❌ OpenAI error: {type(e).__name__} - {e}")
            raise

        except Exception as e:
            logger.error("❌ Unexpected error when calling OpenAI:")
            logger.error(traceback.format_exc())
            raise Exception("Unexpected failure when communicating with OpenAI") from e

    @backoff.on_exception(
        backoff.expo,
        (RateLimitError, APIError, Timeout),
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
        except (RateLimitError, APIError, Timeout) as e:
            logger.error(f"❌ OpenAI error (stream_explanation): {type(e).__name__} - {e}")
            yield f"[OpenAI error: {type(e).__name__} - {e}]"
        except Exception as e:
            logger.error("❌ Unexpected error when calling OpenAI (stream_explanation):")
            logger.error(traceback.format_exc())
            yield f"[Unexpected error: {str(e)}]"
