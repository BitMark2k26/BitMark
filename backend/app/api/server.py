import uuid
from typing import List, Optional
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
)
from app.core.auth import verify_api_key
from app.models.schemas import (
    AnswerKey,
    AnswerKeySummary,
    GradingJobSummary,
    JobResponse,
    PaperEvaluation,
)
from app.services import dbService, evaluationService, taskService

router = APIRouter()

@router.delete(
    "/answer-keys/{paper_id}",
    dependencies=[Depends(verify_api_key)],
)
async def delete_answer_key(paper_id: str):
    deleted = await dbService.delete_answer_key(paper_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Answer key not found")
    return {"deleted": True, "paper_id": paper_id.strip()}
@router.get(
    "/answer-keys",
    response_model=List[AnswerKeySummary],
    dependencies=[Depends(verify_api_key)],
)
async def list_answer_keys():
    return await dbService.list_answer_keys()


@router.get(
    "/answer-keys/{paper_id}",
    response_model=AnswerKey,
    dependencies=[Depends(verify_api_key)],
)
async def get_answer_key(paper_id: str):
    key_data = await dbService.get_answer_key(paper_id)
    if not key_data:
        raise HTTPException(status_code=404, detail="Answer key not found")
    return AnswerKey(**key_data)


@router.put(
    "/answer-keys/{paper_id}",
    response_model=AnswerKey,
    dependencies=[Depends(verify_api_key)],
)
async def update_answer_key(paper_id: str, answer_key: AnswerKey):
    if answer_key.paper_id != paper_id:
        raise HTTPException(status_code=400, detail="paper_id in path and body must match")
    await dbService.save_answer_key(answer_key)
    return answer_key


@router.post(
    "/generate-key",
    response_model=JobResponse,
    dependencies=[Depends(verify_api_key)],
)
async def generate_key(
    background_tasks: BackgroundTasks,
    paper_id: str = Form(...),
    file: UploadFile = File(...),
):
    existing_key = await dbService.get_answer_key(paper_id)
    if existing_key:
        return JobResponse(
            job_id=f"cached-{paper_id}",
            type="generate_key",
            status="completed",
            result=existing_key,
        )

    file_bytes = await file.read()
    job_id = str(uuid.uuid4())
    await dbService.create_job(job_id, "generate_key")

    background_tasks.add_task(
        taskService.process_answer_key_job,
        job_id,
        paper_id,
        file_bytes,
        file.filename or "paper.pdf",
        file.content_type,
    )
    return JobResponse(job_id=job_id, type="generate_key", status="processing")


@router.post(
    "/grade-paper",
    response_model=JobResponse,
    dependencies=[Depends(verify_api_key)],
)
async def grade_paper(
    background_tasks: BackgroundTasks,
    paper_id: str = Form(...),
    file: UploadFile = File(...),
):
    key_data = await dbService.get_answer_key(paper_id)
    if not key_data:
        raise HTTPException(
            status_code=404,
            detail=f"No answer key found for paper_id '{paper_id}'. Generate one first.",
        )

    file_bytes = await file.read()
    job_id = str(uuid.uuid4())
    await dbService.create_job(job_id, "grade_paper")

    background_tasks.add_task(
        taskService.process_grading_job,
        job_id,
        paper_id,
        file_bytes,
        file.filename or "submission.pdf",
        file.content_type,
    )
    return JobResponse(job_id=job_id, type="grade_paper", status="processing")


@router.get(
    "/jobs/{job_id}",
    response_model=JobResponse,
    dependencies=[Depends(verify_api_key)],
)
async def get_job_status(job_id: str):
    job = await dbService.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResponse(**job)


@router.get(
    "/evaluations",
    response_model=List[GradingJobSummary],
    dependencies=[Depends(verify_api_key)],
)
async def list_evaluations(paper_id: Optional[str] = Query(default=None)):
    return await dbService.list_grading_jobs(paper_id=paper_id)

@router.delete(
    "/jobs/{job_id}",
    dependencies=[Depends(verify_api_key)],
)
async def delete_job(job_id: str):
    deleted = await dbService.delete_job(job_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"deleted": True, "job_id": job_id}
@router.put(
    "/jobs/{job_id}/evaluation",
    response_model=PaperEvaluation,
    dependencies=[Depends(verify_api_key)],
)
async def update_student_evaluation(job_id: str, evaluation: PaperEvaluation):
    return await evaluationService.override_evaluation(job_id, evaluation)