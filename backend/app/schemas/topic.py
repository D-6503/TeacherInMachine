from pydantic import BaseModel
from typing import Optional


class SubjectOut(BaseModel):
    id: str
    name: str
    class_level: int
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class TopicOut(BaseModel):
    id: str
    subject_id: str
    title: str
    sequence_order: int
    description: Optional[str] = None
    pdf_url: Optional[str] = None
    summary: Optional[str] = None
    pass_threshold: float
    is_active: bool
    status: Optional[str] = None  # from student_progress join
    best_score: Optional[float] = None

    model_config = {"from_attributes": True}


class TopicCreate(BaseModel):
    subject_id: str
    title: str
    sequence_order: int
    description: Optional[str] = None
    pdf_url: Optional[str] = None
    summary: Optional[str] = None
    pass_threshold: float = 0.70


class TopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    pdf_url: Optional[str] = None
    summary: Optional[str] = None
    pass_threshold: Optional[float] = None
    is_active: Optional[bool] = None


class VideoOut(BaseModel):
    id: str
    topic_id: str
    title: str
    url: str
    duration_seconds: int
    language: str
    is_active: bool

    model_config = {"from_attributes": True}


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    response: str
    context: Optional[str] = None

