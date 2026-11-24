from app.models.schemas import PaperEvaluation

CONFIDENCE_THRESHOLD = 0.75


def apply_paper_confidence(
    evaluation: PaperEvaluation,
    ocr_confidence: float,
) -> PaperEvaluation:
    question_confidences = [q.confidence for q in evaluation.grades]
    avg_llm_confidence = (
        round(sum(question_confidences) / len(question_confidences), 3)
        if question_confidences
        else 0.0
    )

    overall_confidence = round(min(ocr_confidence, avg_llm_confidence), 3)

    evaluation.ocr_confidence = ocr_confidence
    evaluation.confidence = avg_llm_confidence
    evaluation.overall_confidence = overall_confidence

    if overall_confidence < CONFIDENCE_THRESHOLD:
        evaluation.needs_manual_review = True
        reasons = []
        if ocr_confidence < CONFIDENCE_THRESHOLD:
            reasons.append(f"Unclear scan (OCR confidence: {ocr_confidence:.2f})")
        if avg_llm_confidence < CONFIDENCE_THRESHOLD:
            reasons.append(f"Uncertain grading (LLM confidence: {avg_llm_confidence:.2f})")
        evaluation.review_reason = "; ".join(reasons)

    return evaluation