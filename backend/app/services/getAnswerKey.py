from app.core.db import get_db
from app.models.schemas import AnswerKey
async def list_answer_keys() -> list[dict]:
    db = get_db()
    cursor = db.answer_keys.find({}, {"_id": 0, "paper_id": 1, "key": 1})
    summaries = []
    async for doc in cursor:
        questions = doc.get("key", [])
        total_marks = sum(float(q.get("max_score", 0)) for q in questions)

        seen: set[str] = set()
        concepts: list[str] = []
        for q in questions:
            for concept in q.get("key_concepts", []):
                if concept not in seen:
                    seen.add(concept)
                    concepts.append(concept)

        summaries.append({
            "paper_id": doc["paper_id"],
            "question_count": len(questions),
            "total_marks": round(total_marks, 2),
            "key_concepts": concepts,
        })
    return summaries