export type StagedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  file:File;
};
export type QuestionAnswer = {
  question_number: string;
  reference_answer: string;
  max_score: number;
  key_concepts: string[];
};

export type AnswerKey = {
  paper_id: string;
  key: QuestionAnswer[];
};

export type AnswerKeySummary = {
  paper_id: string;
  question_count: number;
  total_marks: number;
  max_total_score?: number;
  key_concepts?: string[];
};
export type QuestionGrade = {
  question_number: string;
  score: number;
  max_score: number;
  reasoning: string;
  missing_concepts: string[];
  confidence: number;
};

export type PaperEvaluation = {
  paper_id: string;
  grades: QuestionGrade[];
  total_score: number;
  max_total_score: number;
  overall_confidence: number;
  needs_manual_review: boolean;
  injection_attempt_detected: boolean;
  review_reason?: string | null;
};

export type GradingJobSummary = {
  job_id: string;
  paper_id?: string | null;
  student_name?: string | null;
  status: "processing" | "completed" | "failed";
  total_score?: number | null;
  max_total_score?: number | null;
  overall_confidence?: number | null;
  needs_manual_review: boolean;
  injection_attempt_detected: boolean;
  review_reason?: string | null;
};

export type JobDetailResponse = {
  job_id: string;
  type?: string | null;
  status: "processing" | "completed" | "failed";
  result?: PaperEvaluation | null;
  error?: string | null;
};
export const inputClassName =
  "mt-2 w-full border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500";
export default StagedFile