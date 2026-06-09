from pydantic import BaseModel
from typing import List, Dict, Optional


class BloomScores(BaseModel):
    remember: float
    understand: float
    apply: float


class WeakArea(BaseModel):
    topic_id: str
    topic_title: str
    subject: str
    best_score: float


class AttemptSummary(BaseModel):
    attempt_id: str
    topic_title: str
    bloom_level: str
    score: Optional[float] = None
    input_mode: str
    created_at: str
    cheat_flags: List[dict] = []


class TopicProgress(BaseModel):
    topic_id: str
    topic_title: str
    subject: str
    status: str
    best_score: float
    attempts_count: int


class StudentDashboard(BaseModel):
    student_id: str
    name: str
    bloom_scores: BloomScores
    total_topics: int
    passed_topics: int
    recent_attempts: List[AttemptSummary]
    weak_areas: List[WeakArea]
    topic_progress: List[TopicProgress]


class AdminOverview(BaseModel):
    total_students: int
    active_students: int
    total_attempts: int
    avg_score: float
    pending_cheat_flags: int
    subject_pass_rates: Dict[str, float]
