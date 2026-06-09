from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class KeystrokeEvent(BaseModel):
    key: str
    timestamp: float
    delta: float
    type: str  # keydown|paste|delete


class SubmitAttemptRequest(BaseModel):
    student_id: str
    question_id: str
    topic_id: str
    answer_text: str
    input_mode: str  # typed|voice
    keystrokes: List[KeystrokeEvent] = []
    wpm: Optional[float] = None
    paste_detected: bool = False
    tab_switches: int = 0


class CheatFlag(BaseModel):
    type: str
    severity: str
    detail: str


class AttemptOut(BaseModel):
    id: str
    student_id: str
    question_id: str
    topic_id: str
    answer_text: str
    input_mode: str
    score: Optional[float] = None
    feedback: Optional[str] = None
    missing_concepts: List[str] = []
    cheat_flags: List[dict] = []
    wpm: Optional[float] = None
    keystroke_count: int
    paste_detected: bool
    tab_switches: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SubmitAttemptResponse(BaseModel):
    attempt_id: str
    score: float
    feedback: str
    missing_concepts: List[str]
    cheat_flags: List[dict]
    topic_status: str
    next_topic_unlocked: bool
    next_topic_id: Optional[str] = None
    unlock_message: str
    student_answer: Optional[str] = None
    expected_answer: Optional[str] = None
