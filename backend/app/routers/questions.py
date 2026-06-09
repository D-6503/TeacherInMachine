from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
import uuid
import random

from app.database import get_db
from app.models.question import Question
from app.schemas.question import QuestionOut, QuestionCreate, QuestionUpdate
from app.dependencies import get_current_user, require_admin
from app.models.student import Student

router = APIRouter()


@router.get("/topics/{topic_id}/questions", response_model=List[QuestionOut])
async def list_questions(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(get_current_user),
):
    try:
        result = await db.execute(
            select(Question).where(
                Question.topic_id == uuid.UUID(topic_id),
                Question.is_active == True,
            )
        )
        questions = list(result.scalars().all())
        bloom_order = {"remember": 0, "understand": 1, "apply": 2, "evaluate": 3}
        questions.sort(key=lambda q: (bloom_order.get(q.bloom_level, 99), q.created_at or ""))
        return [
            QuestionOut(
                id=str(q.id), topic_id=str(q.topic_id), question_text=q.question_text,
                expected_answer=q.expected_answer, bloom_level=q.bloom_level,
                created_by=q.created_by, is_validated=q.is_validated,
                is_active=q.is_active, created_at=q.created_at,
            )
            for q in questions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/questions", response_model=QuestionOut, status_code=201)
async def create_question(
    data: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Student = Depends(require_admin),
):
    try:
        q = Question(
            id=uuid.uuid4(), topic_id=uuid.UUID(data.topic_id),
            question_text=data.question_text, expected_answer=data.expected_answer,
            bloom_level=data.bloom_level, created_by=current_user.role,
            is_validated=False, is_active=True,
        )
        db.add(q)
        await db.flush()
        return QuestionOut(
            id=str(q.id), topic_id=str(q.topic_id), question_text=q.question_text,
            expected_answer=q.expected_answer, bloom_level=q.bloom_level,
            created_by=q.created_by, is_validated=q.is_validated,
            is_active=q.is_active, created_at=q.created_at,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/questions/{question_id}", response_model=QuestionOut)
async def update_question(
    question_id: str,
    data: QuestionUpdate,
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(require_admin),
):
    try:
        result = await db.execute(select(Question).where(Question.id == uuid.UUID(question_id)))
        q = result.scalar_one_or_none()
        if not q:
            raise HTTPException(status_code=404, detail="Question not found")
        for field, val in data.model_dump(exclude_none=True).items():
            setattr(q, field, val)
        await db.flush()
        return QuestionOut(
            id=str(q.id), topic_id=str(q.topic_id), question_text=q.question_text,
            expected_answer=q.expected_answer, bloom_level=q.bloom_level,
            created_by=q.created_by, is_validated=q.is_validated,
            is_active=q.is_active, created_at=q.created_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/questions/{question_id}", status_code=204)
async def delete_question(
    question_id: str,
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(require_admin),
):
    try:
        result = await db.execute(select(Question).where(Question.id == uuid.UUID(question_id)))
        q = result.scalar_one_or_none()
        if not q:
            raise HTTPException(status_code=404, detail="Question not found")
        q.is_active = False
        await db.flush()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/topics/{topic_id}/generate")
async def generate_questions(
    topic_id: str,
    _: Student = Depends(require_admin),
):
    try:
        from tasks.ai_tasks import generate_questions_for_topic
        task = generate_questions_for_topic.delay(topic_id, 3)
        return {"task_id": task.id, "message": "Question generation started. Check back in a few minutes."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to queue task: {str(e)}")
