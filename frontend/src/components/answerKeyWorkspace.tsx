"use client";

import { useEffect, useState } from "react";
import { AnswerKeyEditor } from "./answerKeyEditor";
import { AnswerKeySelector } from "./answerKeySelector";
import type { AnswerKey, AnswerKeySummary } from "../types/type";

export function AnswerKeyWorkspace() {
  const [keys, setKeys] = useState<AnswerKeySummary[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadKeys() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/answerKeys", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load available answer keys.");
        const data: AnswerKeySummary[] = await res.json();
        setKeys(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    }

    loadKeys();
  }, []);

  const handleApproved = (savedKey: AnswerKey) => {
    const cleanId = savedKey.paper_id.trim();
    const updatedMarks = savedKey.key.reduce(
      (sum, q) => sum + (Number(q.max_score) || 0),
      0
    );
    const updatedConcepts = Array.from(
      new Set(savedKey.key.flatMap((q) => q.key_concepts || []))
    );

    setKeys((prev) =>
      prev.map((item) =>
        item.paper_id.trim() === cleanId
          ? {
              ...item,
              paper_id: cleanId,
              question_count: savedKey.key.length,
              total_marks: updatedMarks,
              key_concepts: updatedConcepts,
            }
          : item
      )
    );
  };

  const handleDeleted = (deletedPaperId: string) => {
    const cleanId = deletedPaperId.trim();
    setKeys((prev) => prev.filter((item) => item.paper_id.trim() !== cleanId));
    if (selectedPaperId.trim() === cleanId) {
      setSelectedPaperId("");
    }
  };

  if (isLoading) {
    return (
      <div className="border border-zinc-200 bg-white p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400 sm:p-7">
        Loading available answer keys...
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-rose-300 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-zinc-900/80 dark:text-rose-400 sm:p-7">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnswerKeySelector
        keys={keys}
        selectedPaperId={selectedPaperId}
        onSelect={setSelectedPaperId}
      />

      {selectedPaperId && (
        <AnswerKeyEditor
          key={selectedPaperId}
          paperId={selectedPaperId}
          onApproved={handleApproved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}