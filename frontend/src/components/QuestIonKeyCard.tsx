"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { QuestionAnswer } from "../types/type";

type QuestionKeyCardProps = {
  index: number;
  question: QuestionAnswer;
  onUpdate: <K extends keyof QuestionAnswer>(
    field: K,
    value: QuestionAnswer[K]
  ) => void;
  onRemove: () => void;
};

export function QuestionKeyCard({
  index,
  question,
  onUpdate,
  onRemove,
}: QuestionKeyCardProps) {
  const initialAnswer =
    question.reference_answer ??
    (question as unknown as { model_answer?: string }).model_answer ??
    "";

  const [conceptsInput, setConceptsInput] = useState(
    (question.key_concepts || []).join(", ")
  );

  const handleConceptsChange = (raw: string) => {
    setConceptsInput(raw);
    const parsed = raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    onUpdate("key_concepts", parsed);
  };

  return (
    <div className="border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-400">
            #{index + 1}
          </span>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <span>Question #</span>
            <input
              type="text"
              value={question.question_number}
              onChange={(e) => onUpdate("question_number", e.target.value)}
              className="w-24 border border-slate-700 bg-slate-800 px-2.5 py-1 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <span>Max marks</span>
            <input
              type="number"
              min={0}
              step="any"
              value={question.max_score}
              onChange={(e) => {
                const parsed = parseFloat(e.target.value);
                onUpdate("max_score", Number.isNaN(parsed) ? 0 : parsed);
              }}
              className="w-24 border border-slate-700 bg-slate-800 px-2.5 py-1 text-sm text-amber-300 focus:border-cyan-400 focus:outline-none"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove question ${question.question_number || index + 1}`}
          className="inline-flex items-center gap-1.5 border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:border-red-500 hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Reference answer &amp; grading notes *
          </label>
          <textarea
            rows={5}
            value={initialAnswer}
            onChange={(e) => onUpdate("reference_answer", e.target.value)}
            placeholder="Enter step-by-step solution, expected logic steps, and grading notes..."
            className="w-full border border-slate-700 bg-slate-800 p-3 text-sm leading-relaxed text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Key concepts (comma-separated)
          </label>
          <input
            type="text"
            value={conceptsInput}
            onChange={(e) => handleConceptsChange(e.target.value)}
            placeholder="e.g., implication elimination, Skolemization, CNF"
            className="w-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}