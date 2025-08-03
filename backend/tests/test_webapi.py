from fastapi.testclient import TestClient
from app.webapi.main import app
import os

client = TestClient(app)

def test_upload_csv():
    csv_content = b"a,b\n1,2\n3,4"
    response = client.post("/upload_csv", files={"file": ("test.csv", csv_content, "text/csv")})
    assert response.status_code == 200
    assert "CSV loaded" in response.json()["message"]

def test_ask_empty():
    response = client.post("/ask", json={"question": ""})
    assert response.status_code == 422

def test_ask_valid(monkeypatch):
    class DummyService:
        async def ask(self, q):
            class R: columns = ["a"]; rows = [[1],[2]]
            return R()
    from app.webapi.main import ask_service
    monkeypatch.setattr("app.webapi.main.ask_service", DummyService())
    response = client.post("/ask", json={"question": "How many records are there?"})
    assert response.status_code == 200
    assert response.json()["columns"] == ["a"]
