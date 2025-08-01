db_repo = DBRepository(DB_PATH)
openai_client = OpenAIClient()
ask_service = AskService(openai_client, db_repo)

import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.db_repository import DBRepository
from app.infrastructure.openai_client import OpenAIClient
from app.application.ask_service import AskService
from app.domain.entities import Question
from app.webapi.schemas import AskRequest, AskResponse, UploadCSVResponse
import sqlite3

DB_PATH = os.getenv("DB_PATH", "db/data.db")

# Inicializa la base de datos si no existe
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
if not os.path.exists(DB_PATH):
    with sqlite3.connect(DB_PATH) as conn:
        pass

db_repo = DBRepository(DB_PATH)
openai_client = OpenAIClient()
ask_service = AskService(openai_client, db_repo)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload_csv", response_model=UploadCSVResponse)
async def upload_csv(file: UploadFile = File(...)):
    try:
        file_path = DB_PATH.replace(".db", ".csv")
        with open(file_path, "wb") as f:
            f.write(await file.read())
        ask_service.load_csv(file_path)
        return UploadCSVResponse(message="CSV cargado correctamente")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/ask", response_model=AskResponse)
async def ask(request: AskRequest):
    if not request.question:
        raise HTTPException(status_code=422, detail="Falta el campo 'question'")
    try:
        result = await ask_service.ask(Question(request.question))
        # Fallback: si no hay columnas o filas, o si los datos no son graficables
        if not result.columns or not result.rows:
            return AskResponse(columns=[], rows=[])
        # Si hay más de 20 columnas, probablemente no es graficable
        if len(result.columns) > 20:
            return AskResponse(columns=result.columns[:20], rows=[row[:20] for row in result.rows])
        return AskResponse(columns=result.columns, rows=result.rows)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
