from typing import Any, List, Literal, Optional
from pydantic import BaseModel, Field


class QuestionAnswer(BaseModel):
    question_number: str
    reference_answer: str
    max_score: float = Field(ge=0)
    key_concepts: List[str] = Field(default_factory=list)


class AnswerKey(BaseModel):
    paper_id: str
    key: List[QuestionAnswer]


class AnswerKeySummary(BaseModel):
    paper_id: str
    question_count: int
    total_marks: float
    key_concepts: List[str] = Field(default_factory=list)


class QuestionGrade(BaseModel):
    question_number: str
    score: float = Field(ge=0)
    max_score: float = Field(ge=0)
    reasoning: str
    missing_concepts: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)


class PaperEvaluation(BaseModel):
    paper_id: str
    grades: List[QuestionGrade]
    total_score: float = Field(ge=0)
    max_total_score: float = Field(ge=0)
    ocr_confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    overall_confidence: float = Field(ge=0.0, le=1.0)
    needs_manual_review: bool = False
    injection_attempt_detected: bool = False
    review_reason: Optional[str] = None


class JobResponse(BaseModel):
    job_id: str
    type: Optional[str] = None
    status: Literal["processing", "completed", "failed"]
    result: Optional[Any] = None
    error: Optional[str] = None


class GradingJobSummary(BaseModel):
    job_id: str
    paper_id: Optional[str] = None
    status: Literal["processing", "completed", "failed"]
    total_score: Optional[float] = None
    max_total_score: Optional[float] = None
    overall_confidence: Optional[float] = None
    needs_manual_review: bool = False
    injection_attempt_detected: bool = False
    review_reason: Optional[str] = None