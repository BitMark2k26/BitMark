from fastapi import HTTPException
from app.models.schemas import PaperEvaluation
from app.services import dbService


async def override_evaluation(job_id: str, evaluation: PaperEvaluation) -> PaperEvaluation:
    existing_job = await dbService.get_job(job_id)
    if not existing_job or existing_job.get("type") != "grade_paper":
        raise HTTPException(status_code=404, detail="Grading job not found")

    if existing_job.get("status") != "completed":
        raise HTTPException(
            status_code=400,
            detail="Cannot edit evaluation while job is not completed",
        )

    for question_grade in evaluation.grades:
        question_grade.score = round(
            max(0.0, min(question_grade.score, question_grade.max_score)), 2
        )

    evaluation.total_score = round(sum(q.score for q in evaluation.grades), 2)
    evaluation.max_total_score = round(sum(q.max_score for q in evaluation.grades), 2)
    evaluation.needs_manual_review = False
    evaluation.review_reason = "Manually reviewed and approved"

    updated_job = await dbService.update_evaluation_result(
        job_id, evaluation.model_dump()
    )
    if not updated_job:
        raise HTTPException(status_code=500, detail="Failed to save evaluation override")

    return evaluation