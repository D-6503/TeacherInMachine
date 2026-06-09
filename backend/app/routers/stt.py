from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.dependencies import get_current_user
from app.models.student import Student
from app.services import stt_service

router = APIRouter()


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    _: Student = Depends(get_current_user),
):
    try:
        audio_bytes = await audio.read()
        suffix = ".webm"
        if audio.filename:
            if audio.filename.endswith(".wav"):
                suffix = ".wav"
            elif audio.filename.endswith(".ogg"):
                suffix = ".ogg"
            elif audio.filename.endswith(".mp3"):
                suffix = ".mp3"
        transcript = await stt_service.transcribe(audio_bytes, suffix=suffix)
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
