import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.db_repository import DBRepository
from app.infrastructure.openai_client import OpenAIClient
from app.application.ask_service import AskService
from app.webapi.routes import router
from app.webapi.config import DB_PATH
import sqlite3
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)


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

@app.get("/")
def read_root():
    return {"message": "Funciona"}

app.include_router(router)