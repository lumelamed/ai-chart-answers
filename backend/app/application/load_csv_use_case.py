from app.infrastructure.db_repository import DBRepository

class LoadCSVUseCase:
    def __init__(self, db_repo: DBRepository):
        self.db_repo = db_repo

    def execute(self, csv_path: str, table_name: str = "data"):
        self.db_repo.load_csv(csv_path, table_name)
