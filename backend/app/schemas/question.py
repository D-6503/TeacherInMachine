from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class QuestionOut(BaseModel):
    id: str
    topic_id: str
    question_text: str
    expected_answer: str
    bloom_level: str
    created_by: str
    is_validated: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class QuestionCreate(BaseModel):
    topic_id: str
    question_text: str
    expected_answer: str
    bloom_level: str  # remember|understand|apply


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    expected_answer: Optional[str] = None
    bloom_level: Optional[str] = None
    is_validated: Optional[bool] = None
    is_active: Optional[bool] = None
