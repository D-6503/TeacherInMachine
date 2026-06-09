import tempfile
import os
import logging
from app.config import settings

logger = logging.getLogger(__name__)

_whisper_model = None


def _get_model():
    global _whisper_model
    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel

            _whisper_model = WhisperModel(
                settings.WHISPER_MODEL_SIZE, device="cpu", compute_type="int8"
            )
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
    return _whisper_model


async def transcribe(audio_bytes: bytes, suffix: str = ".webm") -> str:
    model = _get_model()
    if model is None:
        return ""
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as f:
            f.write(audio_bytes)
            tmp_path = f.name
        segments, _ = model.transcribe(tmp_path, beam_size=5)
        transcript = " ".join(seg.text.strip() for seg in segments)
        return transcript.strip()
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        return ""
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
