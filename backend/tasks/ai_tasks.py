import asyncio
import json
import logging
import uuid
from datetime import datetime

import httpx
from celery_app import celery_app

logger = logging.getLogger(__name__)

BLOOM_LEVELS = ["remember", "understand", "apply"]

GEN_PROMPT = """Generate {count} JEE exam questions at Bloom's Taxonomy level "{level}" for the topic: {title}

Reference context:
{context}

Requirements:
- Questions must be specific, precise, and suitable for JEE Main/Advanced
- Expected answers must be complete and accurate
- Bloom level "{level}" means: {level_desc}

Return ONLY a valid JSON array, no markdown, no preamble:
[{{"question_text": "...", "expected_answer": "...", "bloom_level": "{level}"}}]"""

LEVEL_DESC = {
    "remember": "recall of facts, definitions, formulas, and basic concepts",
    "understand": "explaining concepts, comparing ideas, and interpreting meaning",
    "apply": "using formulas in calculations, solving problems, and applying concepts to new situations",
}


async def _generate_for_level(topic_title: str, level: str, context: str, count: int, ollama_url: str, model: str) -> list:
    prompt = GEN_PROMPT.format(
        count=count, level=level, title=topic_title,
        context=context or "No reference context available.",
        level_desc=LEVEL_DESC.get(level, ""),
    )
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{ollama_url}/api/generate",
                json={"model": model, "prompt": prompt, "stream": False},
            )
            resp.raise_for_status()
            raw = resp.json().get("response", "[]").strip()
            
            # Extract JSON array dynamically
            start_idx = raw.find('[')
            end_idx = raw.rfind(']')
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                raw_json = raw[start_idx:end_idx+1]
            else:
                raw_json = raw

            # Escape all backslashes that are not valid JSON escape sequences
            import re
            cleaned_raw = re.sub(r'\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})', r'\\\\', raw_json)
            
            try:
                questions = json.loads(cleaned_raw)
            except Exception as e:
                logger.warning(f"Standard JSON parsing failed for level {level}: {e}. Attempting regex fallback parsing.")
                pattern = r'"question_text"\s*:\s*"(.*?)"\s*,\s*"expected_answer"\s*:\s*"(.*?)"(?:\s*,\s*"bloom_level"|\s*\})'
                matches = re.findall(pattern, raw_json, re.DOTALL)
                questions = []
                for q, a in matches:
                    q_clean = q.strip()
                    a_clean = a.strip()
                    if q_clean.endswith('"'):
                        q_clean = q_clean[:-1]
                    if a_clean.endswith('"'):
                        a_clean = a_clean[:-1]
                    questions.append({
                        "question_text": q_clean,
                        "expected_answer": a_clean,
                        "bloom_level": level
                    })
            
            return questions if isinstance(questions, list) else []
    except Exception as e:
        logger.error(f"Generation failed for level={level}: {e}")
        return []


async def _run_generation(topic_id: str, count_per_level: int):
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
    from sqlalchemy import select
    from app.config import settings
    from app.models.topic import Topic
    from app.models.question import Question
    from app.services.rag_service import get_context

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    AsyncSession_ = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    total_generated = 0
    async with AsyncSession_() as session:
        result = await session.execute(select(Topic).where(Topic.id == uuid.UUID(topic_id)))
        topic = result.scalar_one_or_none()
        if not topic:
            logger.error(f"Topic {topic_id} not found")
            return {"generated": 0, "error": "Topic not found"}

        context = await get_context(topic.title, top_k=5)

        for level in BLOOM_LEVELS:
            questions = await _generate_for_level(
                topic.title, level, context, count_per_level,
                settings.OLLAMA_BASE_URL, settings.OLLAMA_EVAL_MODEL,
            )
            for q_data in questions:
                q = Question(
                    id=uuid.uuid4(),
                    topic_id=topic.id,
                    question_text=q_data.get("question_text", ""),
                    expected_answer=q_data.get("expected_answer", ""),
                    bloom_level=level,
                    created_by="ai",
                    is_validated=False,
                    is_active=True,
                    created_at=datetime.utcnow(),
                )
                session.add(q)
                total_generated += 1

        await session.commit()
        logger.info(f"Generated {total_generated} questions for topic {topic_id}")

    await engine.dispose()
    return {"generated": total_generated}


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def generate_questions_for_topic(self, topic_id: str, count_per_level: int = 3):
    """Generate questions for all Bloom levels for a topic using Ollama."""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(_run_generation(topic_id, count_per_level))
        loop.close()
        return result
    except Exception as exc:
        logger.error(f"Task failed: {exc}")
        raise self.retry(exc=exc)
