from app.application.ask_service import ask_service as default_ask_service
from app.domain.entities import Question
from app.webapi.config import DB_PATH
from app.webapi.schemas import AskRequest, AskResponse, UploadCSVResponse
from fastapi import Depends, APIRouter, UploadFile, File, HTTPException

router = APIRouter()

def get_ask_service():
    return default_ask_service

@router.post("/ask", response_model=AskResponse)
async def ask(request: AskRequest, ask_service=Depends(get_ask_service)):
    try: 
        if not request.question:
            raise HTTPException(status_code=422, detail="La pregunta no puede estar vacía")
        result = await ask_service.ask(Question(question=request.question))
        # Fallback: si no hay columnas o filas, o si los datos no son graficables
        if not result.columns or not result.rows:
            return AskResponse(columns=[], rows=[])
        # Si hay más de 20 columnas, probablemente no es graficable
        if len(result.columns) > 20:
            return AskResponse(columns=result.columns[:20], rows=[row[:20] for row in result.rows])
        return AskResponse(columns=result.columns, rows=result.rows)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/upload_csv", response_model=UploadCSVResponse)
async def upload_csv(file: UploadFile = File(...), ask_service=Depends(get_ask_service)):
    try:
        file_path = DB_PATH.replace(".db", ".csv")
        with open(file_path, "wb") as f:
            f.write(await file.read())
        ask_service.load_csv(file_path)
        return UploadCSVResponse(message="CSV loaded successfully")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
