import os
import openai
import backoff
import logging
import traceback
from openai import RateLimitError, APIError, Timeout

logger = logging.getLogger(__name__)

class OpenAIClient:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        if not openai.api_key:
            logger.warning("⚠️ OPENAI_API_KEY is not configured.")

    @backoff.on_exception(
        backoff.expo,
        (RateLimitError, APIError, Timeout),
        max_tries=3,
        jitter=backoff.full_jitter,
        on_backoff=lambda details: logger.warning(
            f"Retrying OpenAI (trying {details['tries']}) due to: {details['exception']}"
        )
    )
    async def question_to_sql(self, question: str) -> str:
        prompt = f"Translate the following question into a valid SQL query for the database: '{question}'"
        
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Answer clearly and helpfully."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,
            )
            sql = response.choices[0].message.content.strip()
            logger.debug(f"✅ OpenAI replied: {sql}")
            return sql
        
        except (RateLimitError, APIError, Timeout) as e:
            logger.error(f"❌ OpenAI error: {type(e).__name__} - {e}")
            raise  # se vuelve a lanzar para que backoff funcione

        except Exception as e:
            logger.error("❌ Unexpected error when calling OpenAI:")
            logger.error(traceback.format_exc())
            raise Exception("Unexpected failure when communicating with OpenAI") from e
