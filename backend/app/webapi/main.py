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

# MOCK para desarrollo: simula respuestas del backend si MOCK_BACKEND=1
import os
if os.environ.get("MOCK_BACKEND") == "1":
    from app.webapi import routes

    class DummyAskService:
        async def ask(self, question):
            class R:
                columns = ["col1", "col2"]
                rows = [[1, 2], [3, 4]]
            return R()
        def load_csv(self, csv_path, table_name="data"):
            pass

    app.dependency_overrides[routes.get_ask_service] = lambda: DummyAskService()