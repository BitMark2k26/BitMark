"use client";

import { useEffect, useState } from "react";

type BatchDetailsFormProps = {
  selectedBatch: string;
  scheme: string;
  onBatchChange: (value: string) => void;
  onSchemeChange: (value: string) => void;
};

type AnswerKeySummary = {
  paper_id: string;
  question_count: number;
  total_marks: number;
};

const inputClassName =
  "mt-2 w-full border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50";

export function BatchDetailsForm({
  selectedBatch,
  scheme,
  onBatchChange,
  onSchemeChange,
}: BatchDetailsFormProps) {
  const [batches, setBatches] = useState<AnswerKeySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBatches() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/answerKeys");
        if (!res.ok) {
          throw new Error("Failed to load available answer keys.");
        }
        const data: AnswerKeySummary[] = await res.json();
        setBatches(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load batches.");
      } finally {
        setIsLoading(false);
      }
    }

    loadBatches();
  }, []);

  return (
    <div className="border border-slate-700 bg-slate-800 p-5 sm:p-7">
      <h2 className="text-lg font-semibold">Batch details</h2>
      <p className="mt-1 text-sm text-slate-400">
        Choose an available answer key and the marking scheme to use.
      </p>

      {error && (
        <div className="mt-4 border border-red-800 bg-red-950/40 px-3.5 py-2.5 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium sm:col-span-2">
          Available batch or class <span className="text-amber-400">*</span>
          <select
            value={selectedBatch}
            onChange={(event) => onBatchChange(event.target.value)}
            disabled={isLoading || batches.length === 0}
            className={inputClassName}
          >
            <option value="">
              {isLoading
                ? "Loading available answer keys..."
                : batches.length === 0
                ? "No answer keys found — generate one first"
                : "Select a batch or class"}
            </option>
            {batches.map((batch) => (
              <option key={batch.paper_id} value={batch.paper_id}>
                {batch.paper_id} ({batch.question_count} Qs • {batch.total_marks} marks)
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}