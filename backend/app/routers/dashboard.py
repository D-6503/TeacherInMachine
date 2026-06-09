from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
import uuid

from app.database import get_db
from app.models.attempt import Attempt
from app.models.question import Question
from app.models.topic import Topic
from app.models.subject import Subject
from app.models.progress import StudentProgress
from app.models.student import Student
from app.schemas.dashboard import (
    StudentDashboard, BloomScores, WeakArea, AttemptSummary,
    TopicProgress, AdminOverview,
)
from app.dependencies import get_current_user, require_admin

router = APIRouter()


@router.get("/student/{student_id}", response_model=StudentDashboard)
async def get_student_dashboard(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Student = Depends(get_current_user),
):
    try:
        if current_user.role not in ["admin", "tutor"] and str(current_user.id) != student_id:
            raise HTTPException(status_code=403, detail="Access denied")

        student_uuid = uuid.UUID(student_id)

        # Fetch student
        student_result = await db.execute(select(Student).where(Student.id == student_uuid))
        student = student_result.scalar_one_or_none()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Bloom scores — avg score per bloom level
        bloom_result = await db.execute(
            select(Question.bloom_level, func.avg(Attempt.score))
            .join(Attempt, Attempt.question_id == Question.id)
            .where(Attempt.student_id == student_uuid, Attempt.score.is_not(None))
            .group_by(Question.bloom_level)
        )
        bloom_map = {row[0]: round(float(row[1]), 2) for row in bloom_result.fetchall()}
        bloom_scores = BloomScores(
            remember=bloom_map.get("remember", 0.0),
            understand=bloom_map.get("understand", 0.0),
            apply=bloom_map.get("apply", 0.0),
        )

        # Fetch all active topics and subjects
        topics_result = await db.execute(
            select(Topic, Subject)
            .join(Subject, Topic.subject_id == Subject.id)
            .where(Topic.is_active == True)
            .order_by(Subject.name, Topic.sequence_order)
        )
        all_topics_rows = topics_result.fetchall()

        # Fetch progress for this student
        progress_res = await db.execute(
            select(StudentProgress)
            .where(StudentProgress.student_id == student_uuid)
        )
        progress_map = {str(p.topic_id): p for p in progress_res.scalars().all()}

        topic_progress = []
        for t, s in all_topics_rows:
            prog = progress_map.get(str(t.id))
            if prog:
                status = prog.status
                best_score = prog.best_score
                attempts_count = prog.attempts_count
            else:
                status = "in_progress" if t.sequence_order == 1 else "locked"
                best_score = 0.0
                attempts_count = 0
            
            topic_progress.append(TopicProgress(
                topic_id=str(t.id), topic_title=t.title, subject=s.name,
                status=status, best_score=best_score, attempts_count=attempts_count,
            ))
        total_topics = len(topic_progress)
        passed_topics = sum(1 for tp in topic_progress if tp.status == "passed")

        # Weak areas (best_score < 6.0 out of 10)
        weak_areas = [
            WeakArea(
                topic_id=tp.topic_id, topic_title=tp.topic_title,
                subject=tp.subject, best_score=tp.best_score,
            )
            for tp in topic_progress
            if tp.best_score < 6.0 and tp.status != "locked"
        ]

        # Recent 20 attempts
        attempts_result = await db.execute(
            select(Attempt, Question, Topic)
            .join(Question, Attempt.question_id == Question.id)
            .join(Topic, Attempt.topic_id == Topic.id)
            .where(Attempt.student_id == student_uuid)
            .order_by(Attempt.created_at.desc())
            .limit(20)
        )
        recent_attempts = [
            AttemptSummary(
                attempt_id=str(a.id), topic_title=t.title, bloom_level=q.bloom_level,
                score=a.score, input_mode=a.input_mode,
                created_at=a.created_at.isoformat(), cheat_flags=a.cheat_flags or [],
            )
            for a, q, t in attempts_result.fetchall()
        ]

        return StudentDashboard(
            student_id=student_id, name=student.name,
            bloom_scores=bloom_scores, total_topics=total_topics,
            passed_topics=passed_topics, recent_attempts=recent_attempts,
            weak_areas=weak_areas, topic_progress=topic_progress,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/overview", response_model=AdminOverview)
async def admin_overview(
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(require_admin),
):
    try:
        total_students = (await db.execute(select(func.count(Student.id)))).scalar() or 0
        active_students = (await db.execute(select(func.count(Student.id)).where(Student.is_active == True))).scalar() or 0
        total_attempts = (await db.execute(select(func.count(Attempt.id)))).scalar() or 0
        avg_score_result = (await db.execute(select(func.avg(Attempt.score)).where(Attempt.score.is_not(None)))).scalar()
        avg_score = round(float(avg_score_result), 2) if avg_score_result else 0.0

        # Pending cheat flags (attempts with non-empty cheat_flags)
        flags_result = await db.execute(
            select(func.count(Attempt.id)).where(Attempt.cheat_flags != [])
        )
        pending_flags = flags_result.scalar() or 0

        # Subject pass rates
        subjects_result = await db.execute(select(Subject))
        subjects = subjects_result.scalars().all()
        subject_pass_rates = {}
        for subj in subjects:
            topics_result = await db.execute(select(Topic.id).where(Topic.subject_id == subj.id))
            topic_ids = [r[0] for r in topics_result.fetchall()]
            if topic_ids:
                passed = (await db.execute(
                    select(func.count(StudentProgress.id))
                    .where(StudentProgress.topic_id.in_(topic_ids), StudentProgress.status == "passed")
                )).scalar() or 0
                total_prog = (await db.execute(
                    select(func.count(StudentProgress.id))
                    .where(StudentProgress.topic_id.in_(topic_ids))
                )).scalar() or 1
                subject_pass_rates[subj.name] = round(passed / total_prog * 100, 1)

        return AdminOverview(
            total_students=total_students, active_students=active_students,
            total_attempts=total_attempts, avg_score=avg_score,
            pending_cheat_flags=pending_flags, subject_pass_rates=subject_pass_rates,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
