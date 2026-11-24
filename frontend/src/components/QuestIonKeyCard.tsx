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
    <div className="border border-zinc-200 bg-zinc-50 p-4 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-100 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
            #{index + 1}
          </span>
          <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span>Question #</span>
            <input
              type="text"
              value={question.question_number}
              onChange={(e) => onUpdate("question_number", e.target.value)}
              className="w-24 border border-zinc-300 bg-white px-2.5 py-1 text-sm text-zinc-900 focus:border-cyan-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-cyan-400"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
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
              className="w-24 border border-zinc-300 bg-white px-2.5 py-1 text-sm text-amber-600 focus:border-cyan-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-amber-300 dark:focus:border-cyan-400"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove question ${question.question_number || index + 1}`}
          className="inline-flex items-center gap-1.5 border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-700 hover:border-rose-500 hover:text-rose-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-rose-500 dark:hover:text-rose-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Reference answer &amp; grading notes *
          </label>
          <textarea
            rows={5}
            value={initialAnswer}
            onChange={(e) => onUpdate("reference_answer", e.target.value)}
            placeholder="Enter step-by-step solution, expected logic steps, and grading notes..."
            className="w-full border border-zinc-300 bg-white p-3 text-sm leading-relaxed text-zinc-900 placeholder-zinc-400 focus:border-cyan-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Key concepts (comma-separated)
          </label>
          <input
            type="text"
            value={conceptsInput}
            onChange={(e) => handleConceptsChange(e.target.value)}
            placeholder="e.g., implication elimination, Skolemization, CNF"
            className="w-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-cyan-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-cyan-400"
          />
        </div>
      </div>
    </div>
  );
}