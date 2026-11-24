"use client";

import { AlertTriangle } from "lucide-react";
import type { QuestionGrade } from "../types/type"; 

type QuestionGradeCardProps = {
  grade: QuestionGrade;
  onChange: (updated: QuestionGrade) => void;
};

export function QuestionGradeCard({ grade, onChange }: QuestionGradeCardProps) {
  const isLowConfidence = grade.confidence < 0.75;
  const confidencePct = Math.round(grade.confidence * 100);

  const handleScoreChange = (raw: string) => {
    const parsed = parseFloat(raw);
    const nextScore = Number.isNaN(parsed)
      ? 0
      : Math.max(0, Math.min(parsed, grade.max_score));
    onChange({ ...grade, score: nextScore });
  };

  return (
    <div
      className={`border p-5 ${
        isLowConfidence
          ? "border-amber-400 bg-amber-50/70 dark:border-amber-500/50 dark:bg-amber-500/5"
          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/70"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-zinc-200/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:bg-zinc-900 dark:text-cyan-400">
            Q{grade.question_number}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${
              isLowConfidence
                ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {isLowConfidence && <AlertTriangle className="h-3.5 w-3.5" />}
            Confidence: {confidencePct}%
          </span>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Marks:</span>
          <input
            type="number"
            step="0.5"
            min={0}
            max={grade.max_score}
            value={grade.score}
            onChange={(e) => handleScoreChange(e.target.value)}
            className="w-20 border border-zinc-300 bg-white px-2.5 py-1.5 text-right text-sm font-semibold text-zinc-900 outline-none focus:border-cyan-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <span className="text-zinc-600 dark:text-zinc-400">/ {grade.max_score}</span>
        </label>
      </div>

      <div className="mt-4">
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Grading Reasoning
          <textarea
            rows={2}
            value={grade.reasoning}
            onChange={(e) => onChange({ ...grade, reasoning: e.target.value })}
            className="mt-2 w-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </label>
      </div>

      {grade.missing_concepts.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-600 dark:text-zinc-400">Missing concepts:</span>
          {grade.missing_concepts.map((concept) => (
            <span
              key={concept}
              className="border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
            >
              {concept}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}