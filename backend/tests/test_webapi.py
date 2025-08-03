from fastapi.testclient import TestClient
from app.webapi.main import app
import os

client = TestClient(app)

def test_upload_csv():
    class DummyService:
        def load_csv(self, csv_path, table_name="data"):
            pass
    from app.webapi import routes
    app.dependency_overrides[routes.get_ask_service] = lambda: DummyService()
    csv_content = b"a,b\n1,2\n3,4"
    response = client.post("/upload_csv", files={"file": ("test.csv", csv_content, "text/csv")})
    assert response.status_code == 200
    assert "CSV loaded successfully" in response.json()["message"]
    app.dependency_overrides = {}

def test_ask_empty():
    response = client.post("/ask", json={"question": ""})
    assert response.status_code == 422

def test_ask_valid():
    class DummyService:
        async def ask(self, q):
            class R: columns = ["a"]; rows = [[1],[2]]
            return R()
    from app.webapi import routes
    app.dependency_overrides[routes.get_ask_service] = lambda: DummyService()
    response = client.post("/ask", json={"question": "How many records are there?"})
    assert response.status_code == 200
    assert response.json()["columns"] == ["a"]
    app.dependency_overrides = {}
