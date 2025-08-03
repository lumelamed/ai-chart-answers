from backend.app.application import ask_service
from backend.app.domain.entities import Question
from backend.app.webapi.main import DB_PATH
from backend.app.webapi.schemas import AskRequest, AskResponse, UploadCSVResponse
from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()

@router.post("/ask", response_model=AskResponse)
async def ask(request: AskRequest):
    try: 
        if not request.question:
            result = await ask_service.ask(Question(request.question))
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
async def upload_csv(file: UploadFile = File(...)):
    try:
        file_path = DB_PATH.replace(".db", ".csv")
        with open(file_path, "wb") as f:
            f.write(await file.read())
        ask_service.load_csv(file_path)
        return UploadCSVResponse(message="CSV cargado correctamente")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
