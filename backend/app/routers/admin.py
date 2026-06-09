from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
import uuid

from app.database import get_db
from app.models.student import Student
from app.models.attempt import Attempt
from app.models.progress import StudentProgress
from app.models.topic import Topic
from app.models.subject import Subject
from app.dependencies import require_admin

router = APIRouter()


@router.get("/overview")
async def get_overview(
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(require_admin),
):
    try:
        # Total and active students
        total_students = (await db.execute(
            select(func.count(Student.id)).where(Student.role == "student")
        )).scalar() or 0

        active_students = (await db.execute(
            select(func.count(Student.id)).where(Student.role == "student", Student.is_active == True)
        )).scalar() or 0

        # Total attempts
        total_attempts = (await db.execute(
            select(func.count(Attempt.id))
        )).scalar() or 0

        # Average score across all attempts
        avg_score_raw = (await db.execute(
            select(func.avg(Attempt.score)).where(Attempt.score.isnot(None))
        )).scalar()
        avg_score = round(float(avg_score_raw), 1) if avg_score_raw is not None else 0.0

        # Pending cheat flags (attempts with non-empty cheat_flags list)
        all_attempts = (await db.execute(select(Attempt))).scalars().all()
        pending_cheat_flags = sum(1 for a in all_attempts if a.cheat_flags and len(a.cheat_flags) > 0)

        # Subject pass rates
        subjects_result = (await db.execute(select(Subject))).scalars().all()
        subject_pass_rates: dict = {}
        for subj in subjects_result:
            topics_result = (await db.execute(
                select(Topic).where(Topic.subject_id == subj.id)
            )).scalars().all()
            topic_ids = [t.id for t in topics_result]
            if not topic_ids:
                subject_pass_rates[subj.name] = 0
                continue
            passed = (await db.execute(
                select(func.count(StudentProgress.id)).where(
                    StudentProgress.topic_id.in_(topic_ids),
                    StudentProgress.status == "passed",
                )
            )).scalar() or 0
            total_prog = (await db.execute(
                select(func.count(StudentProgress.id)).where(
                    StudentProgress.topic_id.in_(topic_ids),
                )
            )).scalar() or 1
            subject_pass_rates[subj.name] = round((passed / total_prog) * 100, 1)

        return {
            "total_students": total_students,
            "active_students": active_students,
            "total_attempts": total_attempts,
            "avg_score": avg_score,
            "pending_cheat_flags": pending_cheat_flags,
            "subject_pass_rates": subject_pass_rates,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/students")
async def list_students(
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(require_admin),
):
    try:
        result = await db.execute(
            select(Student).where(Student.role == "student").order_by(Student.created_at.desc())
        )
        students = result.scalars().all()
        out = []
        for s in students:
            attempt_count = (await db.execute(
                select(func.count(Attempt.id)).where(Attempt.student_id == s.id)
            )).scalar() or 0
            passed_count = (await db.execute(
                select(func.count(StudentProgress.id)).where(
                    StudentProgress.student_id == s.id,
                    StudentProgress.status == "passed",
                )
            )).scalar() or 0
            out.append({
                "id": str(s.id), "name": s.name, "email": s.email,
                "role": s.role, "is_active": s.is_active,
                "created_at": s.created_at.isoformat(),
                "attempt_count": attempt_count, "passed_topics": passed_count,
            })
        return out
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/students/{student_id}/detail")
async def student_detail(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(require_admin),
):
    try:
        result = await db.execute(select(Student).where(Student.id == uuid.UUID(student_id)))
        student = result.scalar_one_or_none()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        progress_result = await db.execute(
            select(StudentProgress, Topic, Subject)
            .join(Topic, StudentProgress.topic_id == Topic.id)
            .join(Subject, Topic.subject_id == Subject.id)
            .where(StudentProgress.student_id == uuid.UUID(student_id))
            .order_by(Subject.name, Topic.sequence_order)
        )
        progress = [
            {
                "topic_id": str(p.topic_id), "topic_title": t.title,
                "subject": s.name, "status": p.status,
                "best_score": p.best_score, "attempts_count": p.attempts_count,
            }
            for p, t, s in progress_result.fetchall()
        ]
        return {
            "id": str(student.id), "name": student.name, "email": student.email,
            "role": student.role, "is_active": student.is_active,
            "created_at": student.created_at.isoformat(), "progress": progress,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cheat-flags")
async def get_cheat_flags(
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(require_admin),
):
    try:
        result = await db.execute(
            select(Attempt, Student, Topic)
            .join(Student, Attempt.student_id == Student.id)
            .join(Topic, Attempt.topic_id == Topic.id)
            .where(Attempt.cheat_flags != [])
            .order_by(Attempt.created_at.desc())
            .limit(100)
        )
        rows = result.fetchall()
        return [
            {
                "attempt_id": str(a.id), "student_id": str(a.student_id),
                "student_name": s.name, "student_email": s.email,
                "topic_title": t.title, "topic_id": str(a.topic_id),
                "cheat_flags": a.cheat_flags, "score": a.score,
                "created_at": a.created_at.isoformat(),
            }
            for a, s, t in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cheat-flags/{attempt_id}/dismiss", status_code=200)
async def dismiss_flag(
    attempt_id: str,
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(require_admin),
):
    try:
        result = await db.execute(select(Attempt).where(Attempt.id == uuid.UUID(attempt_id)))
        attempt = result.scalar_one_or_none()
        if not attempt:
            raise HTTPException(status_code=404, detail="Attempt not found")
        attempt.cheat_flags = []
        await db.flush()
        return {"message": "Cheat flags dismissed"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cheat-flags/{attempt_id}/escalate", status_code=200)
async def escalate_flag(
    attempt_id: str,
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(require_admin),
):
    try:
        result = await db.execute(select(Attempt).where(Attempt.id == uuid.UUID(attempt_id)))
        attempt = result.scalar_one_or_none()
        if not attempt:
            raise HTTPException(status_code=404, detail="Attempt not found")
        flags = attempt.cheat_flags or []
        attempt.cheat_flags = [{**f, "escalated": True} for f in flags]
        await db.flush()
        return {"message": "Flags escalated for review"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
