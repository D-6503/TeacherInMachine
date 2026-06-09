from celery import Celery
from app.config import settings

celery_app = Celery(
    "jee_tasks",
    broker=settings.RABBITMQ_URL,
    backend=settings.REDIS_URL,
    include=["tasks.ai_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)
