from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import os

from app.routers import auth, topics, questions, attempts, stt, dashboard, admin, videos
from app.services.storage_service import ensure_bucket

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure static directory exists
    os.makedirs("static/uploads", exist_ok=True)
    try:
        ensure_bucket()
        logger.info("Storage initialization completed")
    except Exception as e:
        logger.warning(f"Storage initialization encountered error: {e}")
    yield


app = FastAPI(
    title="TIM Platform API",
    version="1.0.0",
    description="AI-powered adaptive TIM (Teacher in Machine) learning platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files from static folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(topics.router, prefix="/api", tags=["topics"])
app.include_router(questions.router, prefix="/api", tags=["questions"])
app.include_router(attempts.router, prefix="/api/attempts", tags=["attempts"])
app.include_router(stt.router, prefix="/api/stt", tags=["stt"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(videos.router, prefix="/api/videos", tags=["videos"])


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "service": "tim-platform"}
