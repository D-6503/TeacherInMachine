import httpx
import json
import logging
from app.config import settings

logger = logging.getLogger(__name__)

EVAL_PROMPT = (
    "You are an extremely strict JEE (Joint Entrance Exam) academic evaluator. Evaluate the student's answer against the expected answer and the NCERT reference context.\n\n"
    "Question: {question}\n"
    "Bloom Level: {bloom_level}\n"
    "NCERT Reference Context: {context}\n"
    "Expected Answer: {expected_answer}\n"
    "Student Answer: {student_answer}\n\n"
    "--- EVALUATION RUBRIC ---\n"
    "1. Concept Score (0 to 3):\n"
    "   - 3: Correct physical concepts matched perfectly.\n"
    "   - 2: Mostly correct physical concepts, minor misconception.\n"
    "   - 1: Severe misconception but relevant topic.\n"
    "   - 0: Completely incorrect, irrelevant, or blank.\n"
    "2. Formula Score (0 to 3):\n"
    "   - 3: Correct formulas/equations with correct symbols/variables.\n"
    "   - 2: Correct formula but minor notation/index error.\n"
    "   - 1: Stated an irrelevant formula or incorrect relationship.\n"
    "   - 0: No formula or completely wrong formula.\n"
    "3. Completeness & Reasoning Score (0 to 4):\n"
    "   - 4: Fully addresses the question, explains reasoning steps, precise details.\n"
    "   - 2-3: Addresses most parts of the question, minor missing detail.\n"
    "   - 1: Highly incomplete or lacks reasoning.\n"
    "   - 0: No reasoning provided or blank.\n\n"
    "Return ONLY a valid JSON object. Do not wrap in markdown code blocks. No preamble. Follow this schema exactly:\n"
    "{{\n"
    '  "concept_score": <int 0-3>,\n'
    '  "formula_score": <int 0-3>,\n'
    '  "completeness_score": <int 0-4>,\n'
    '  "feedback": "Detailed socratic feedback comparing student and expected answers (max 2 sentences)",\n'
    '  "missing_concepts": ["<concept1>", "<concept2>"]\n'
    "}}"
)


async def evaluate_answer(
    question: str,
    bloom_level: str,
    context: str,
    expected_answer: str,
    student_answer: str,
) -> dict:
    prompt = EVAL_PROMPT.format(
        question=question,
        bloom_level=bloom_level,
        context=context or "No reference context available.",
        expected_answer=expected_answer,
        student_answer=student_answer,
    )
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_EVAL_MODEL,
                    "prompt": prompt,
                    "format": "json",
                    "stream": False,
                    "options": {
                        "temperature": 0.0,
                        "num_predict": 250,
                        "num_ctx": 2048
                    }
                },
            )
            response.raise_for_status()
            raw = response.json().get("response", "{}").strip()
            
            # Clean markdown code block wraps if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            
            result = None
            try:
                result = json.loads(raw.strip())
            except Exception as e:
                logger.warning(f"Standard JSON parsing failed for evaluate_answer: {e}. Trying robust regex fallback.")
                # Fallback 1: Extract block inside first '{' and last '}'
                start_idx = raw.find('{')
                end_idx = raw.rfind('}')
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    cleaned_raw = raw[start_idx:end_idx+1]
                    try:
                        result = json.loads(cleaned_raw)
                    except Exception:
                        pass
                
                # Fallback 2: Regex extraction
                if not result:
                    import re
                    concept_match = re.search(r'"concept_score"\s*:\s*(\d+)', raw)
                    formula_match = re.search(r'"formula_score"\s*:\s*(\d+)', raw)
                    completeness_match = re.search(r'"completeness_score"\s*:\s*(\d+)', raw)
                    feedback_match = re.search(r'"feedback"\s*:\s*"(.*?)"', raw, re.DOTALL)
                    missing_match = re.search(r'"missing_concepts"\s*:\s*\[(.*?)\]', raw, re.DOTALL)
                    
                    concept_val = int(concept_match.group(1)) if concept_match else 0
                    formula_val = int(formula_match.group(1)) if formula_match else 0
                    completeness_val = int(completeness_match.group(1)) if completeness_match else 0
                    
                    feedback = feedback_match.group(1).strip() if feedback_match else "Answer evaluated."
                    
                    missing_concepts = []
                    if missing_match:
                        concepts_raw = missing_match.group(1)
                        missing_concepts = [c.strip().strip('"').strip("'") for c in re.findall(r'["\'](.*?)["\']', concepts_raw)]
                        missing_concepts = [c for c in missing_concepts if c]
                        
                    result = {
                        "concept_score": concept_val,
                        "formula_score": formula_val,
                        "completeness_score": completeness_val,
                        "feedback": feedback,
                        "missing_concepts": missing_concepts
                    }

            concept_score = int(result.get("concept_score", 0)) if result else 0
            formula_score = int(result.get("formula_score", 0)) if result else 0
            completeness_score = int(result.get("completeness_score", 0)) if result else 0
            calculated_score = concept_score + formula_score + completeness_score

            return {
                "score": max(0, min(10, calculated_score)),
                "feedback": result.get("feedback", "Answer evaluated.") if result else "Answer evaluated.",
                "missing_concepts": result.get("missing_concepts", []) if result else [],
            }
    except httpx.ConnectError:
        logger.warning("Ollama not reachable, using fallback score")
    except Exception as e:
        import traceback
        logger.error(f"AI evaluation failed: {e}\n{traceback.format_exc()}")

    return {
        "score": 5,
        "feedback": "AI evaluation temporarily unavailable. Score is estimated.",
        "missing_concepts": [],
    }


async def chat_with_tutor(
    message: str,
    topic_title: str,
    context: str,
    history: list = None
) -> str:
    if history is None:
        history = []
    
    # Format latest message to inject RAG context and active topic
    formatted_content = (
        f"Active Topic/Chapter: {topic_title}\n"
        f"NCERT Reference Context:\n{context or 'No specific reference context available.'}\n\n"
        f"Student Question: {message}"
    )

    
    # Rebuild history in Ollama-compatible format
    messages = []
    for msg in history:
        messages.append({"role": msg.get("role"), "content": msg.get("content")})
    
    messages.append({"role": "user", "content": formatted_content})
    
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": settings.OLLAMA_MODEL,  # tim-tutor
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "num_predict": 800,  # Ensure complete answers
                        "num_ctx": 2048
                    }

                }
            )
            response.raise_for_status()
            return response.json().get("message", {}).get("content", "I am having trouble replying right now.")
    except Exception as e:
        logger.error("Ollama chat_with_tutor failed", exc_info=True)
        return "I am unable to reach the tutor service. Please check your connection."

