#!/usr/bin/env python3
"""
CLI script to trigger AI question generation for a specific topic.

Usage:
    python generate_questions.py --topic-id <uuid> [--count 3]
    python generate_questions.py --list-topics
"""
import argparse
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


async def list_topics():
    """List all available topics."""
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
    from sqlalchemy import select
    from app.config import settings
    from app.models.topic import Topic
    from app.models.subject import Subject

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    AsyncSession_ = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSession_() as session:
        result = await session.execute(
            select(Topic, Subject)
            .join(Subject, Topic.subject_id == Subject.id)
            .order_by(Subject.name, Topic.sequence_order)
        )
        rows = result.fetchall()
        print(f"\n{'ID':<40} {'Subject':<15} {'Order':<6} {'Title'}")
        print("-" * 90)
        for topic, subject in rows:
            print(f"{str(topic.id):<40} {subject.name:<15} {topic.sequence_order:<6} {topic.title}")

    await engine.dispose()


async def trigger_generation(topic_id: str, count: int):
    """Trigger Celery task for question generation."""
    from tasks.ai_tasks import generate_questions_for_topic
    print(f"\nTriggering question generation for topic {topic_id}...")
    result = generate_questions_for_topic.delay(topic_id, count)
    print(f"Task submitted: {result.id}")
    print("Questions will be generated asynchronously by the Celery worker.")
    print("Run 'docker-compose logs celery_worker -f' to monitor progress.")


def main():
    parser = argparse.ArgumentParser(description="Generate AI questions for a JEE topic")
    parser.add_argument("--topic-id", type=str, help="Topic UUID to generate questions for")
    parser.add_argument("--count", type=int, default=3, help="Questions per bloom level (default: 3)")
    parser.add_argument("--list-topics", action="store_true", help="List all available topics")
    args = parser.parse_args()

    if args.list_topics:
        asyncio.run(list_topics())
    elif args.topic_id:
        asyncio.run(trigger_generation(args.topic_id, args.count))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
