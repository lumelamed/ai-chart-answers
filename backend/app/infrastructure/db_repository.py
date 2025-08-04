import sqlite3
from typing import Tuple
import logging
from app.infrastructure.sql_helper import is_safe_sql

logger = logging.getLogger(__name__)

class DBRepository:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def execute_sql(self, sql: str) -> Tuple[list, list]:
        with sqlite3.connect(self.db_path) as conn:
            logger.info(f"✅ SQL Query: {sql}")
            cursor = conn.cursor()
            cursor.execute(sql)
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            logger.info(f"✅ SQL Query Result - columns:{columns} rows:{rows}")
        return columns, rows

    def load_csv(self, csv_path: str, table_name: str = "data"):
        import pandas as pd
        df = pd.read_csv(csv_path)
        
        if "date" in df.columns:
            df["date"] = pd.to_datetime(
                df["date"], format="mixed", dayfirst=True, errors="coerce"
            ).dt.strftime("%Y-%m-%d")

            invalid_dates = df["date"].isna().sum()
            if invalid_dates > 0:
                logger.warning(f"⚠️ {invalid_dates} fechas no se pudieron parsear correctamente.")

        with sqlite3.connect(self.db_path) as conn:
            df.to_sql(table_name, conn, if_exists='replace', index=False)

    def is_valid_sql(self, sql: str, connection: sqlite3.Connection) -> bool:
        try:
            connection.execute(f"EXPLAIN {sql}")
            return True
        except sqlite3.Error as e:
            logger.warning(f"❌ SQL syntax error: {e}")
            return False
        
    def validate_sql(self, sql: str) -> None:
        if not is_safe_sql(sql):
            raise ValueError("Potentially unsafe SQL query")
        with sqlite3.connect(self.db_path) as conn:
            if not self.is_valid_sql(sql, conn):
                raise ValueError("Invalid SQL syntax")
            
    def get_schema_description(self) -> str:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()

            schema_lines = []
            for (table,) in tables:
                cursor.execute(f"PRAGMA table_info({table});")
                columns = [col[1] for col in cursor.fetchall()]
                schema_lines.append(f"- {table}({', '.join(columns)})")

            return "Tables:\n" + "\n".join(schema_lines)


