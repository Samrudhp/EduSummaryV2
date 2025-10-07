from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class UploadResponse(BaseModel):
    status: str
    message: str
    textbook_name: str
    total_chunks: int


class StatusResponse(BaseModel):
    ready: bool
    textbook_name: Optional[str]
    total_chunks: Optional[int]
    message: str


class GenerateRequest(BaseModel):
    chapter: str
    option: str  # summary, conceptmap, tricks, all


class QnAItem(BaseModel):
    question: str
    answer: str


class GenerateResponse(BaseModel):
    chapter: str
    summary: Optional[str] = None
    concept_map: Optional[str] = None
    tricks: Optional[str] = None
    qna: Optional[List[QnAItem]] = None


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    question: str
    answer: str
    sources: Optional[List[str]] = None
