from pydantic import BaseModel
from typing import List, Any

class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    columns: List[str]
    rows: List[List[Any]]

class UploadCSVResponse(BaseModel):
    message: str

class ExplainRequest(BaseModel):
    columns: List[str]
    rows: List[List[Any]]
