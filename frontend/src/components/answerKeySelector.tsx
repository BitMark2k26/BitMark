"use client";

import type { AnswerKeySummary } from "../types/type";

type AnswerKeySelectorProps = {
  keys: AnswerKeySummary[];
  selectedPaperId: string;
  onSelect: (paperId: string) => void;
};

export function AnswerKeySelector({
  keys,
  selectedPaperId,
  onSelect,
}: AnswerKeySelectorProps) {
  return (
    <div className="border border-slate-700 bg-slate-800 p-5 sm:p-7">
      <h2 className="text-lg font-semibold">Available answer keys</h2>
      <p className="mt-1 text-sm text-slate-400">
        Select an exam paper below to review or edit its reference answers.
      </p>

      {keys.length === 0 ? (
        <div className="mt-5 border border-slate-700 bg-slate-900 p-4 text-sm text-slate-400">
          No answer keys found yet. Generate one from a question paper first.
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {keys.map((item) => {
            const isSelected = item.paper_id === selectedPaperId;
            const visibleConcepts = (item.key_concepts || []).slice(0, 3);
            const remainingCount = (item.key_concepts || []).length - visibleConcepts.length;

            return (
              <button
                key={item.paper_id}
                type="button"
                onClick={() => onSelect(item.paper_id)}
                className={`border p-4 text-left transition-colors ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-slate-700 bg-slate-900 hover:border-slate-500"
                }`}
              >
                <div className="text-sm font-semibold text-slate-100">
                  {item.paper_id}
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
                  <span>{item.question_count} questions</span>
                  <span>•</span>
                  <span className="text-amber-400">{item.total_marks} marks</span>
                </div>

                {visibleConcepts.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {visibleConcepts.map((concept) => (
                      <span
                        key={concept}
                        className="border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-300"
                      >
                        {concept}
                      </span>
                    ))}
                    {remainingCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[11px] text-slate-400">
                        +{remainingCount} more
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}