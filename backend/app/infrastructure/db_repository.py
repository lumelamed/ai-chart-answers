import sqlite3
from typing import Tuple, List

class DBRepository:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def execute_sql(self, sql: str) -> Tuple[list, list]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(sql)
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
        return columns, rows

    def load_csv(self, csv_path: str, table_name: str = "data"):
        import pandas as pd
        df = pd.read_csv(csv_path)
        with sqlite3.connect(self.db_path) as conn:
            df.to_sql(table_name, conn, if_exists='replace', index=False)
