from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
import uuid
from datetime import datetime

from app.database import get_db
from app.models.attempt import Attempt
from app.models.question import Question
from app.schemas.attempt import SubmitAttemptRequest, SubmitAttemptResponse, AttemptOut
from app.services import anticheat_service, evaluation_service, gating_service
from app.dependencies import get_current_user, require_admin
from app.models.student import Student

router = APIRouter()


@router.post("/submit", response_model=SubmitAttemptResponse)
async def submit_attempt(
    data: SubmitAttemptRequest,
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(get_current_user),
):
    try:
        # 1. Load question
        q_result = await db.execute(select(Question).where(Question.id == uuid.UUID(data.question_id)))
        question = q_result.scalar_one_or_none()
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")

        # 2. Anti-cheat analysis
        cheat_flags = anticheat_service.analyze(
            answer_text=data.answer_text,
            keystrokes=data.keystrokes,
            wpm=data.wpm,
            paste_detected=data.paste_detected,
            tab_switches=data.tab_switches,
            keystroke_count=len([k for k in data.keystrokes if k.type == "keydown"]),
        )

        # 3. AI evaluation
        eval_result = await evaluation_service.evaluate(question, data.answer_text)

        # 4. Save attempt
        attempt = Attempt(
            id=uuid.uuid4(),
            student_id=uuid.UUID(data.student_id),
            question_id=uuid.UUID(data.question_id),
            topic_id=uuid.UUID(data.topic_id),
            answer_text=data.answer_text,
            input_mode=data.input_mode,
            score=float(eval_result["score"]),
            feedback=eval_result["feedback"],
            missing_concepts=eval_result["missing_concepts"],
            cheat_flags=cheat_flags,
            wpm=data.wpm,
            keystroke_count=len([k for k in data.keystrokes if k.type == "keydown"]),
            paste_detected=data.paste_detected,
            tab_switches=data.tab_switches,
            created_at=datetime.utcnow(),
        )
        db.add(attempt)
        attempt_id_str = str(attempt.id)
        await db.flush()

        # 5. Gating check
        gate = await gating_service.check_and_gate(data.student_id, data.topic_id, db)
        await db.flush()

        return SubmitAttemptResponse(
            attempt_id=attempt_id_str,
            score=float(eval_result["score"]),
            feedback=eval_result["feedback"],
            missing_concepts=eval_result["missing_concepts"],
            cheat_flags=cheat_flags,
            topic_status=gate.get("unlocked") and "passed" or "in_progress",
            next_topic_unlocked=gate.get("unlocked", False),
            next_topic_id=gate.get("next_topic_id"),
            unlock_message=gate.get("message", ""),
            student_answer=data.answer_text,
            expected_answer=question.expected_answer,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Submission failed: {str(e)}")


@router.get("/students/{student_id}/attempts", response_model=List[AttemptOut])
async def get_student_attempts(
    student_id: str,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: Student = Depends(get_current_user),
):
    try:
        # Students can only view their own; admin can view anyone
        if current_user.role not in ["admin", "tutor"] and str(current_user.id) != student_id:
            raise HTTPException(status_code=403, detail="Access denied")
        result = await db.execute(
            select(Attempt)
            .where(Attempt.student_id == uuid.UUID(student_id))
            .order_by(Attempt.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        attempts = result.scalars().all()
        return [
            AttemptOut(
                id=str(a.id), student_id=str(a.student_id), question_id=str(a.question_id),
                topic_id=str(a.topic_id), answer_text=a.answer_text, input_mode=a.input_mode,
                score=a.score, feedback=a.feedback, missing_concepts=a.missing_concepts or [],
                cheat_flags=a.cheat_flags or [], wpm=a.wpm,
                keystroke_count=a.keystroke_count, paste_detected=a.paste_detected,
                tab_switches=a.tab_switches, created_at=a.created_at,
            )
            for a in attempts
        ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/topics/{topic_id}/attempts/summary")
async def get_topic_attempt_summary(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Student = Depends(get_current_user),
):
    try:
        result = await db.execute(
            select(func.count(Attempt.id), func.avg(Attempt.score))
            .where(
                Attempt.student_id == current_user.id,
                Attempt.topic_id == uuid.UUID(topic_id),
                Attempt.score.is_not(None),
            )
        )
        count, avg_score = result.one()
        return {
            "topic_id": topic_id,
            "attempt_count": count or 0,
            "avg_score": round(float(avg_score), 2) if avg_score else 0.0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
