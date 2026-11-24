from app.models.schemas import AnswerKey, PaperEvaluation


def wrap_untrusted_submission(student_text: str) -> str:
    cleaned = (
        student_text.replace("<student_submission>", "")
        .replace("</student_submission>", "")
    )
    return f"<student_submission>\n{cleaned}\n</student_submission>"


def enforce_score_bounds(
    evaluation: PaperEvaluation,
    answer_key: AnswerKey,
) -> PaperEvaluation:
    max_score_map = {q.question_number: q.max_score for q in answer_key.key}

    computed_total = 0.0
    computed_max = 0.0

    for grade in evaluation.grades:
        allowed_max = max_score_map.get(grade.question_number, grade.max_score)
        grade.max_score = allowed_max
        grade.score = max(0.0, min(grade.score, allowed_max))
        computed_total += grade.score
        computed_max += allowed_max

    evaluation.total_score = round(computed_total, 2)
    evaluation.max_total_score = round(computed_max, 2)
    return evaluation


def apply_security_flags(evaluation: PaperEvaluation) -> PaperEvaluation:
    if evaluation.injection_attempt_detected:
        evaluation.needs_manual_review = True
        flag_msg = "Potential prompt injection attempt detected"
        evaluation.review_reason = (
            f"{evaluation.review_reason}; {flag_msg}"
            if evaluation.review_reason
            else flag_msg
        )
    return evaluation