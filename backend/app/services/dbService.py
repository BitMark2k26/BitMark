import re
from datetime import datetime, timezone
from typing import Any
from app.core.db import get_db


def _normalize_paper_id(paper_id: str) -> str:
    return paper_id.strip()


async def create_job(job_id: str, job_type: str) -> None:
    db = get_db()
    now = datetime.now(timezone.utc)
    await db.jobs.insert_one(
        {
            "job_id": job_id,
            "type": job_type,
            "status": "processing",
            "result": None,
            "error": None,
            "created_at": now,
            "updated_at": now,
        }
    )


async def update_job(
    job_id: str,
    status: str,
    result: dict[str, Any] | None = None,
    error: str | None = None,
) -> None:
    db = get_db()
    update_doc: dict[str, Any] = {
        "status": status,
        "updated_at": datetime.now(timezone.utc),
    }
    if result is not None:
        update_doc["result"] = result
    if error is not None:
        update_doc["error"] = error

    await db.jobs.update_one({"job_id": job_id}, {"$set": update_doc})


async def get_job(job_id: str) -> dict[str, Any] | None:
    db = get_db()
    return await db.jobs.find_one({"job_id": job_id}, {"_id": 0})

async def delete_answer_key(paper_id: str) -> bool:
    db = get_db()
    clean_id = _normalize_paper_id(paper_id)
    if not clean_id:
        return False

    result = await db.answer_keys.delete_one({"paper_id": clean_id})
    if result.deleted_count > 0:
        return True

    pattern = rf"^\s*{re.escape(clean_id)}\s*$"
    regex_result = await db.answer_keys.delete_one(
        {"paper_id": {"$regex": pattern, "$options": "i"}}
    )
    return regex_result.deleted_count > 0
async def save_answer_key(answer_key: Any) -> None:
    db = get_db()
    payload = answer_key.model_dump() if hasattr(answer_key, "model_dump") else dict(answer_key)
    clean_id = _normalize_paper_id(str(payload.get("paper_id", "")))
    payload["paper_id"] = clean_id
    payload["updated_at"] = datetime.now(timezone.utc)

    await db.answer_keys.update_one(
        {"paper_id": clean_id},
        {"$set": payload},
        upsert=True,
    )


async def get_answer_key(paper_id: str) -> dict[str, Any] | None:
    db = get_db()
    clean_id = _normalize_paper_id(paper_id)
    doc = await db.answer_keys.find_one({"paper_id": clean_id}, {"_id": 0})
    if doc:
        if isinstance(doc.get("paper_id"), str):
            doc["paper_id"] = doc["paper_id"].strip()
        return doc

    pattern = rf"^\s*{re.escape(clean_id)}\s*$"
    doc = await db.answer_keys.find_one(
        {"paper_id": {"$regex": pattern}},
        {"_id": 0},
    )
    if doc and isinstance(doc.get("paper_id"), str):
        doc["paper_id"] = doc["paper_id"].strip()
    return doc


async def list_answer_keys() -> list[dict[str, Any]]:
    db = get_db()
    cursor = db.answer_keys.find({}, {"_id": 0})
    keys: list[dict[str, Any]] = []
    async for doc in cursor:
        pid = str(doc.get("paper_id", "")).strip()
        items = doc.get("key") or []
        max_total_score = sum(
            float(q.get("max_score", 0.0)) for q in items if isinstance(q, dict)
        )
        keys.append(
            {
                "paper_id": pid,
                "question_count": len(items),
                "total_marks": max_total_score,
                "max_total_score": max_total_score,
            }
        )
    return keys

async def delete_job(job_id: str) -> bool:
    db = get_db()
    result = await db.jobs.delete_one({"job_id": job_id})
    return result.deleted_count > 0
async def list_grading_jobs(paper_id: str | None = None) -> list[dict[str, Any]]:
    db = get_db()
    query: dict[str, Any] = {"type": "grade_paper"}
    if paper_id:
        clean_id = _normalize_paper_id(paper_id)
        query["result.paper_id"] = {"$regex": rf"^\s*{re.escape(clean_id)}\s*$"}

    cursor = db.jobs.find(query, {"_id": 0}).sort("created_at", -1)
    summaries: list[dict[str, Any]] = []
    async for job in cursor:
        res = job.get("result") or {}
        summaries.append(
            {
                "job_id": job.get("job_id"),
                "status": job.get("status"),
                "paper_id": str(res.get("paper_id", "")).strip() or None,
                "total_score": res.get("total_score"),
                "max_total_score": res.get("max_total_score"),
                "overall_confidence": res.get("overall_confidence"),
                "needs_manual_review": res.get("needs_manual_review", False),
                "injection_attempt_detected": res.get("injection_attempt_detected", False),
                "error": job.get("error"),
            }
        )
    return summaries