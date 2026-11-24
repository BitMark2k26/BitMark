"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Save, ShieldAlert } from "lucide-react";
import { QuestionGradeCard } from "./questionGradeCard";
import type { PaperEvaluation, QuestionGrade } from "../types/type";

type EvaluationEditorProps = {
  jobId: string;
  evaluation: PaperEvaluation;
  onSaved: (jobId: string, updated: PaperEvaluation) => void;
};

export function EvaluationEditor({
  jobId,
  evaluation,
  onSaved,
}: EvaluationEditorProps) {
  const [draft, setDraft] = useState<PaperEvaluation>(evaluation);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(evaluation);
    setSaveMessage(null);
    setError(null);
  }, [jobId, evaluation]);

  const handleQuestionChange = (index: number, updatedGrade: QuestionGrade) => {
    const nextGrades = draft.grades.map((g, i) => (i === index ? updatedGrade : g));
    const totalScore = Number(
      nextGrades.reduce((sum, g) => sum + g.score, 0).toFixed(2)
    );
    setDraft({ ...draft, grades: nextGrades, total_score: totalScore });
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || "Failed to save marks.");
      }

      const saved: PaperEvaluation = await res.json();
      setDraft(saved);
      setSaveMessage("Marks saved and paper marked as reviewed.");
      onSaved(jobId, saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const confidencePct = Math.round(draft.overall_confidence * 100);
  const isLowConfidence = draft.overall_confidence < 0.75;

  return (
    <div className="space-y-6 border border-zinc-200 bg-white p-5 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <div>
          
          <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">{draft.paper_id}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span
              className={`font-medium ${
                isLowConfidence
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              Overall Confidence: {confidencePct}%
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              Total: {draft.total_score} / {draft.max_total_score}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-400 disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Saving..." : "Approve & Save Marks"}
        </button>
      </div>

      {draft.injection_attempt_detected && (
        <div className="flex items-start gap-3 border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Prompt Injection Detected</p>
            <p className="mt-1 text-rose-700/80 dark:text-rose-200/80">
              {draft.review_reason ||
                "Suspicious instructions were found in the student submission. Verify all marks manually."}
            </p>
          </div>
        </div>
      )}

      {!draft.injection_attempt_detected && draft.needs_manual_review && (
        <div className="flex items-start gap-3 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Flagged for Manual Review</p>
            <p className="mt-1 text-amber-700/90 dark:text-amber-200/80">
              {draft.review_reason ||
                "Overall confidence is below the 75% threshold. Review the highlighted questions below."}
            </p>
          </div>
        </div>
      )}

      {saveMessage && (
        <div className="flex items-center gap-2 border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {saveMessage}
        </div>
      )}

      {error && (
        <div className="border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {draft.grades.map((grade, index) => (
          <QuestionGradeCard
            key={grade.question_number}
            grade={grade}
            onChange={(updated) => handleQuestionChange(index, updated)}
          />
        ))}
      </div>
    </div>
  );
}