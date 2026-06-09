import logging
import statistics
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.attempt import Attempt
from app.models.progress import StudentProgress
from app.models.topic import Topic
from app.models.question import Question

logger = logging.getLogger(__name__)


async def check_and_gate(student_id: str, topic_id: str, db: AsyncSession) -> dict:
    try:
        result = await db.execute(
            select(Attempt.score).where(
                Attempt.student_id == uuid.UUID(student_id),
                Attempt.topic_id == uuid.UUID(topic_id),
                Attempt.score.is_not(None),
            )
        )
        scores = [row[0] for row in result.fetchall()]
        if not scores:
            return {"unlocked": False, "current_score": 0.0, "needed_score": 7.0,
                    "message": "No scored attempts yet"}

        topic_result = await db.execute(select(Topic).where(Topic.id == uuid.UUID(topic_id)))
        topic = topic_result.scalar_one_or_none()
        if not topic:
            return {"unlocked": False, "message": "Topic not found"}

        avg_score = sum(scores) / (len(scores) * 10)
        threshold = topic.pass_threshold

        sp_result = await db.execute(
            select(StudentProgress).where(
                StudentProgress.student_id == uuid.UUID(student_id),
                StudentProgress.topic_id == uuid.UUID(topic_id),
            )
        )
        progress = sp_result.scalar_one_or_none()
        if not progress:
            progress = StudentProgress(
                id=uuid.uuid4(), student_id=uuid.UUID(student_id),
                topic_id=uuid.UUID(topic_id), status="in_progress",
                best_score=max(scores), attempts_count=len(scores),
                updated_at=datetime.utcnow(),
            )
            db.add(progress)
        else:
            progress.best_score = max(progress.best_score, max(scores))
            progress.attempts_count = len(scores)
            progress.updated_at = datetime.utcnow()

        # Check if student attempted all questions in this topic
        q_count_result = await db.execute(
            select(func.count(Question.id)).where(
                Question.topic_id == uuid.UUID(topic_id),
                Question.is_active == True,
            )
        )
        total_questions = q_count_result.scalar_one() or 0

        attempted_q_result = await db.execute(
            select(func.count(func.distinct(Attempt.question_id))).where(
                Attempt.student_id == uuid.UUID(student_id),
                Attempt.topic_id == uuid.UUID(topic_id),
                Attempt.score.is_not(None),
            )
        )
        attempted_count = attempted_q_result.scalar_one() or 0

        if attempted_count < total_questions:
            await db.flush()
            remaining = total_questions - attempted_count
            return {
                "unlocked": False,
                "current_score": round(avg_score * 10, 2),
                "needed_score": round(threshold * 10, 2),
                "message": f"Answered {attempted_count}/{total_questions} questions. Complete all questions to unlock the next chapter (remaining: {remaining}).",
            }

        if avg_score >= threshold:
            progress.status = "passed"
            await db.flush()

            next_result = await db.execute(
                select(Topic).where(
                    Topic.subject_id == topic.subject_id,
                    Topic.sequence_order == topic.sequence_order + 1,
                    Topic.is_active == True,
                )
            )
            next_topic = next_result.scalar_one_or_none()
            if next_topic:
                next_sp_result = await db.execute(
                    select(StudentProgress).where(
                        StudentProgress.student_id == uuid.UUID(student_id),
                        StudentProgress.topic_id == next_topic.id,
                    )
                )
                next_prog = next_sp_result.scalar_one_or_none()
                if not next_prog:
                    db.add(StudentProgress(
                        id=uuid.uuid4(), student_id=uuid.UUID(student_id),
                        topic_id=next_topic.id, status="in_progress",
                        best_score=0.0, attempts_count=0, updated_at=datetime.utcnow(),
                    ))
                elif next_prog.status == "locked":
                    next_prog.status = "in_progress"
                    next_prog.updated_at = datetime.utcnow()
                await db.flush()
                return {"unlocked": True, "next_topic_id": str(next_topic.id),
                        "message": f"Congratulations! You unlocked '{next_topic.title}'"}
            return {"unlocked": True, "next_topic_id": None,
                    "message": "Topic passed! You've completed this subject level."}
        else:
            await db.flush()
            return {
                "unlocked": False,
                "current_score": round(avg_score * 10, 2),
                "needed_score": round(threshold * 10, 2),
                "message": f"Score {avg_score*10:.1f}/10. Need {threshold*10:.1f}/10 average to unlock next chapter.",
            }
    except Exception as e:
        logger.error(f"Gating check error: {e}")
        return {"unlocked": False, "current_score": 0.0, "needed_score": 7.0,
                "message": "Gating check temporarily unavailable"}
