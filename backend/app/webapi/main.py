import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.webapi.routes import router
from app.webapi.config import DB_PATH
import sqlite3
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)

# Inicializa la base de datos si no existe
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
if not os.path.exists(DB_PATH):
    with sqlite3.connect(DB_PATH) as conn:
        pass

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)