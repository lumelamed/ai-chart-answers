import os
from functools import lru_cache
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from app.domain.entities import Question, QueryResult
from app.webapi.config import DB_PATH
from app.webapi.schemas import AskRequest, AskResponse, UploadCSVResponse
from app.application.ask_question_use_case import AskQuestionUseCase
from app.application.load_csv_use_case import LoadCSVUseCase
from app.application.explain_result_use_case import ExplainResultUseCase
from app.infrastructure.openai_client import OpenAIClient
from app.infrastructure.db_repository import DBRepository

router = APIRouter()

# DBRepository se instancia por request para evitar problemas de concurrencia con SQLite.
# Si se migra a PostgreSQL y el repo es thread-safe, se podría usar singleton.
def get_db_repo():
    return DBRepository(DB_PATH)

# OpenAIClient es stateless y costoso de crear, así que se hace singleton.
# Si en el futuro se agrega autenticación de usuario o configuración dinámica,
# se debería crear una instancia por request o por usuario.
@lru_cache()
def get_openai_client():
    return OpenAIClient()

@lru_cache()
def get_ask_question_use_case(openai_client=Depends(get_openai_client)):
    class MockAskQuestionUseCase:
        async def execute(self, question):
            return QueryResult(
                columns=["col1", "col2"],
                rows=[[1, 2], [3, 4]]
            )
    if os.getenv("MOCK_BACKEND") == "1":
        return MockAskQuestionUseCase()
    return AskQuestionUseCase(openai_client, get_db_repo())

@lru_cache()
def get_load_csv_use_case():
    return LoadCSVUseCase(get_db_repo())

@lru_cache()
def get_explain_result_use_case(openai_client=Depends(get_openai_client)):
    return ExplainResultUseCase(openai_client)


@router.post("/ask", response_model=AskResponse)
async def ask(
    request: AskRequest,
    use_case: AskQuestionUseCase = Depends(get_ask_question_use_case),
):
    try:
        if not request.question:
            raise HTTPException(status_code=422, detail="Question must be populated")
        result = await use_case.execute(Question(question=request.question))
        # Fallback: si no hay columnas o filas, o si los datos no son graficables
        if not result.columns or not result.rows:
            return AskResponse(columns=[], rows=[])
        # Si hay más de 20 columnas, probablemente no es graficable
        if len(result.columns) > 20:
            return AskResponse(columns=result.columns[:20], rows=[row[:20] for row in result.rows])
        return AskResponse(columns=result.columns, rows=result.rows)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain")
async def explain(
    data: dict,
    use_case: ExplainResultUseCase = Depends(get_explain_result_use_case),
):
    columns = data.get("columns", [])
    rows = data.get("rows", [])
    return StreamingResponse(use_case.execute(columns, rows), media_type="text/plain")

@router.post("/upload_csv", response_model=UploadCSVResponse)
async def upload_csv(
    file: UploadFile = File(...),
    use_case: LoadCSVUseCase = Depends(get_load_csv_use_case),
):
    try:
        file_path = DB_PATH.replace(".db", ".csv")
        with open(file_path, "wb") as f:
            f.write(await file.read())
        use_case.execute(file_path)
        return UploadCSVResponse(message="CSV loaded successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
