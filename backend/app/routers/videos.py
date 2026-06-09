from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid
import subprocess
import json
import tempfile
import os
import logging
from datetime import datetime

from app.database import get_db
from app.models.video import Video
from app.schemas.topic import VideoOut
from app.dependencies import get_current_user, require_admin
from app.models.student import Student
from app.services import storage_service

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_DURATION_SECONDS = 600


def get_video_duration(file_path: str) -> float:
    """Use ffprobe to get video duration in seconds. Falls back to default if ffprobe not found."""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", file_path],
            capture_output=True, text=True, timeout=30,
        )
        data = json.loads(result.stdout)
        return float(data["format"]["duration"])
    except FileNotFoundError:
        logger.warning("ffprobe not found on system PATH. Using default duration fallback of 300s.")
        return 300.0
    except Exception as e:
        logger.warning(f"ffprobe failed to determine video duration: {e}. Using default fallback of 300s.")
        return 300.0


@router.post("/upload", status_code=201)
async def upload_video(
    topic_id: str = Form(...),
    title: str = Form(...),
    language: str = Form(default="en"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(require_admin),
):
    tmp_path = None
    try:
        video_bytes = await file.read()

        # Write to temp file for ffprobe
        suffix = os.path.splitext(file.filename or ".mp4")[1] or ".mp4"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(video_bytes)
            tmp_path = tmp.name

        duration = get_video_duration(tmp_path)
        if duration > MAX_DURATION_SECONDS:
            raise HTTPException(
                status_code=422,
                detail=f"Video duration {duration:.0f}s exceeds maximum of {MAX_DURATION_SECONDS}s (10 minutes).",
            )

        # Upload to MinIO
        object_name = f"videos/{uuid.uuid4()}{suffix}"
        storage_service.upload_file(video_bytes, object_name, content_type=file.content_type or "video/mp4")
        video_url = storage_service.get_presigned_url(object_name)

        video = Video(
            id=uuid.uuid4(), topic_id=uuid.UUID(topic_id), title=title,
            url=video_url, duration_seconds=int(duration),
            language=language, is_active=True, created_at=datetime.utcnow(),
        )
        db.add(video)
        await db.flush()

        return VideoOut(
            id=str(video.id), topic_id=str(video.topic_id), title=video.title,
            url=video.url, duration_seconds=video.duration_seconds,
            language=video.language, is_active=video.is_active,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@router.get("/topics/{topic_id}/videos", response_model=List[VideoOut])
async def list_videos(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(get_current_user),
):
    try:
        result = await db.execute(
            select(Video)
            .where(Video.topic_id == uuid.UUID(topic_id), Video.is_active == True)
            .order_by(Video.created_at)
        )
        videos = result.scalars().all()
        return [
            VideoOut(
                id=str(v.id), topic_id=str(v.topic_id), title=v.title,
                url=v.url, duration_seconds=v.duration_seconds,
                language=v.language, is_active=v.is_active,
            )
            for v in videos
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{video_id}", status_code=204)
async def delete_video(
    video_id: str,
    db: AsyncSession = Depends(get_db),
    _: Student = Depends(require_admin),
):
    try:
        result = await db.execute(select(Video).where(Video.id == uuid.UUID(video_id)))
        video = result.scalar_one_or_none()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        video.is_active = False
        await db.flush()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
