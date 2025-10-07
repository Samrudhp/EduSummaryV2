from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class SectionInfo(BaseModel):
    id: str
    title: str
    preview: str


class UploadResponse(BaseModel):
    status: str
    message: str
    textbook_name: str
    total_chunks: int
    sections: List[SectionInfo]


class StatusResponse(BaseModel):
    ready: bool
    textbook_name: Optional[str]
    total_chunks: Optional[int]
    sections: Optional[List[SectionInfo]]
    message: str


class GenerateRequest(BaseModel):
    section_id: str  # Changed from chapter to section_id
    option: str  # summary, conceptmap, tricks, all


class QnAItem(BaseModel):
    question: str
    answer: str


class GenerateResponse(BaseModel):
    section_id: str  # Changed from chapter
    section_title: str
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
