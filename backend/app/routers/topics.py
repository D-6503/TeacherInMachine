from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.database import get_db
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.progress import StudentProgress
from app.models.video import Video
from app.schemas.topic import SubjectOut, TopicOut, TopicCreate, TopicUpdate, VideoOut, ChatRequest, ChatResponse
from app.dependencies import get_current_user, require_admin
from app.models.student import Student
from app.services import storage_service, rag_service, ai_service

router = APIRouter()


@router.get("/subjects", response_model=List[SubjectOut])
async def list_subjects(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Subject).order_by(Subject.name))
        subjects = result.scalars().all()
        return [SubjectOut(id=str(s.id), name=s.name, class_level=s.class_level, description=s.description) for s in subjects]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subjects/{subject_id}/topics", response_model=List[TopicOut])
async def list_topics_for_subject(
    subject_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Student = Depends(get_current_user),
):
    try:
        subject_uuid = uuid.UUID(subject_id)
        result = await db.execute(
            select(Topic).where(Topic.subject_id == subject_uuid, Topic.is_active == True).order_by(Topic.sequence_order)
        )
        topics = result.scalars().all()

        # Fetch progress for current user
        progress_result = await db.execute(
            select(StudentProgress).where(StudentProgress.student_id == current_user.id)
        )
        progress_map = {str(p.topic_id): p for p in progress_result.scalars().all()}

        out = []
        for t in topics:
            prog = progress_map.get(str(t.id))
            status = "locked"
            if prog:
                status = prog.status
            elif t.sequence_order == 1:
                status = "in_progress"
            
            # Generate dynamic PDF URL to handle expiry/fallback
            pdf_url = storage_service.get_presigned_url(t.pdf_url) if t.pdf_url else None

            out.append(TopicOut(
                id=str(t.id), subject_id=str(t.subject_id), title=t.title,
                sequence_order=t.sequence_order, description=t.description,
                pdf_url=pdf_url, summary=t.summary, pass_threshold=t.pass_threshold,
                is_active=t.is_active,
                status=status,
                best_score=prog.best_score if prog else 0.0,
            ))
        return out
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid subject_id")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/topics/{topic_id}", response_model=TopicOut)
async def get_topic(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Student = Depends(get_current_user),
):
    try:
        topic_uuid = uuid.UUID(topic_id)
        result = await db.execute(select(Topic).where(Topic.id == topic_uuid))
        topic = result.scalar_one_or_none()
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")

        prog_result = await db.execute(
            select(StudentProgress).where(
                StudentProgress.student_id == current_user.id,
                StudentProgress.topic_id == topic_uuid,
            )
        )
        prog = prog_result.scalar_one_or_none()

        status = "locked"
        if prog:
            status = prog.status
        elif topic.sequence_order == 1:
            status = "in_progress"

        pdf_url = storage_service.get_presigned_url(topic.pdf_url) if topic.pdf_url else None

        return TopicOut(
            id=str(topic.id), subject_id=str(topic.subject_id), title=topic.title,
            sequence_order=topic.sequence_order, description=topic.description,
            pdf_url=pdf_url, summary=topic.summary, pass_threshold=topic.pass_threshold,
            is_active=topic.is_active,
            status=status,
            best_score=prog.best_score if prog else 0.0,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/topics/{topic_id}", response_model=TopicOut)
async def update_topic(
    topic_id: str,
    data: TopicUpdate,
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(require_admin),
):
    try:
        result = await db.execute(select(Topic).where(Topic.id == uuid.UUID(topic_id)))
        topic = result.scalar_one_or_none()
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
        for field, val in data.model_dump(exclude_none=True).items():
            setattr(topic, field, val)
        await db.flush()

        pdf_url = storage_service.get_presigned_url(topic.pdf_url) if topic.pdf_url else None

        return TopicOut(
            id=str(topic.id), subject_id=str(topic.subject_id), title=topic.title,
            sequence_order=topic.sequence_order, description=topic.description,
            pdf_url=pdf_url, summary=topic.summary, pass_threshold=topic.pass_threshold,
            is_active=topic.is_active, status=None, best_score=None,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/topics", response_model=TopicOut, status_code=201)
async def create_topic(
    data: TopicCreate,
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(require_admin),
):
    try:
        topic = Topic(
            id=uuid.uuid4(), subject_id=uuid.UUID(data.subject_id), title=data.title,
            sequence_order=data.sequence_order, description=data.description,
            pdf_url=data.pdf_url, summary=data.summary, pass_threshold=data.pass_threshold,
            is_active=True,
        )
        db.add(topic)
        await db.flush()

        pdf_url = storage_service.get_presigned_url(topic.pdf_url) if topic.pdf_url else None

        return TopicOut(
            id=str(topic.id), subject_id=str(topic.subject_id), title=topic.title,
            sequence_order=topic.sequence_order, description=topic.description,
            pdf_url=pdf_url, summary=topic.summary, pass_threshold=topic.pass_threshold,
            is_active=topic.is_active, status=None, best_score=None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/topics/{topic_id}/pdf")
async def upload_topic_pdf(
    topic_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(require_admin),
):
    try:
        topic_uuid = uuid.UUID(topic_id)
        result = await db.execute(select(Topic).where(Topic.id == topic_uuid))
        topic = result.scalar_one_or_none()
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")

        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        file_bytes = await file.read()
        object_name = f"pdfs/{topic_id}.pdf"
        uploaded_key = storage_service.upload_file(file_bytes, object_name, "application/pdf")

        topic.pdf_url = uploaded_key
        await db.flush()

        # Index PDF contents to Qdrant background collection
        background_tasks.add_task(rag_service.index_pdf, topic_id, file_bytes)

        return {
            "topic_id": topic_id,
            "pdf_url": storage_service.get_presigned_url(uploaded_key),
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid topic_id")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/topics/{topic_id}/chat", response_model=ChatResponse)
async def chat_with_topic_tutor(
    topic_id: str,
    data: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Student = Depends(get_current_user),
):
    try:
        topic_uuid = uuid.UUID(topic_id)
        result = await db.execute(select(Topic).where(Topic.id == topic_uuid))
        topic = result.scalar_one_or_none()
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")

        # Get context from RAG service, filtering by topic_id
        context = await rag_service.get_topic_context(query=data.message, topic_id=topic_id, top_k=3)

        # Chat with tutor
        history_list = [{"role": msg.role, "content": msg.content} for msg in data.history]
        response_text = await ai_service.chat_with_tutor(
            message=data.message,
            topic_title=topic.title,
            context=context,
            history=history_list,
        )


        return ChatResponse(response=response_text, context=context)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid topic_id")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

