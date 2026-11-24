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
  "mt-2 w-full border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500";

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
    <div className="border border-zinc-200 bg-white p-5 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100 sm:p-7">
      <h2 className="text-lg font-semibold">Batch details</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Choose an available answer key and the marking scheme to use.
      </p>

      {error && (
        <div className="mt-4 border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium sm:col-span-2">
          Available batch or class <span className="text-amber-600 dark:text-amber-400">*</span>
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