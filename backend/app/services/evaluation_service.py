from app.services import ai_service, rag_service
from app.models.question import Question


async def evaluate(question: Question, student_answer: str) -> dict:
    context = await rag_service.get_topic_context(
        query=question.question_text,
        topic_id=str(question.topic_id),
        top_k=3
    )
    result = await ai_service.evaluate_answer(
        question=question.question_text,
        bloom_level=question.bloom_level,
        context=context,
        expected_answer=question.expected_answer,
        student_answer=student_answer,
    )
    return result
