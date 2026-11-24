from app.models.schemas import AnswerKey
from app.services import (
    confidenceService,
    dbService,
    llmService,
    ocr,
    securityService,
)


async def process_answer_key_job(
    job_id: str,
    paper_id: str,
    file_bytes: bytes,
    filename: str,
    content_type: str | None,
) -> None:
    clean_paper_id = paper_id.strip()
    try:
        ocr_result = await ocr.extract_text_from_bytes(
            file_bytes, filename, content_type, enhance_scan=False
        )
        if not ocr_result.text:
            await dbService.update_job(
                job_id,
                status="failed",
                error="No text extracted from document.",
            )
            return

        verified_key = await llmService.generate_and_verify_key(
            ocr_result.text, clean_paper_id
        )
        verified_key.paper_id = clean_paper_id
        await dbService.save_answer_key(verified_key)
        await dbService.update_job(
            job_id,
            status="completed",
            result=verified_key.model_dump(),
        )
    except Exception as exc:
        await dbService.update_job(job_id, status="failed", error=str(exc))


async def process_grading_job(
    job_id: str,
    paper_id: str,
    file_bytes: bytes,
    filename: str,
    content_type: str | None,
) -> None:
    clean_paper_id = paper_id.strip()
    try:
        key_data = await dbService.get_answer_key(clean_paper_id)
        if not key_data:
            await dbService.update_job(
                job_id,
                status="failed",
                error=f"Answer key not found for paper_id: {clean_paper_id}",
            )
            return

        ocr_result = await ocr.extract_text_from_bytes(
            file_bytes, filename, content_type, enhance_scan=True
        )
        if not ocr_result.text:
            await dbService.update_job(
                job_id,
                status="failed",
                error="No text extracted from student copy.",
            )
            return

        wrapped_text = securityService.wrap_untrusted_submission(ocr_result.text)
        answer_key = AnswerKey(**key_data)

        evaluation = await llmService.evaluate_student_paper(answer_key, wrapped_text)
        evaluation = securityService.enforce_score_bounds(evaluation, answer_key)
        evaluation = confidenceService.apply_paper_confidence(
            evaluation, ocr_result.ocr_confidence
        )
        evaluation = securityService.apply_security_flags(evaluation)

        await dbService.update_job(
            job_id,
            status="completed",
            result=evaluation.model_dump(),
        )
    except Exception as exc:
        await dbService.update_job(job_id, status="failed", error=str(exc))