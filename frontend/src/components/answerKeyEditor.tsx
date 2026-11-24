"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { QuestionKeyCard } from "./QuestIonKeyCard";
import type { AnswerKey, QuestionAnswer } from "../types/type";

type AnswerKeyEditorProps = {
  paperId: string;
  onApproved?: (savedKey: AnswerKey) => void;
  onDeleted?: (deletedPaperId: string) => void;
};

export function AnswerKeyEditor({
  paperId,
  onApproved,
  onDeleted,
}: AnswerKeyEditorProps) {
  const cleanPaperId = paperId.trim();

  const [answerKey, setAnswerKey] = useState<AnswerKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    async function loadAnswerKey() {
      if (!cleanPaperId) {
        setError("Missing paper ID.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/answerKeys/${encodeURIComponent(cleanPaperId)}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to load answer key.");

        const data: AnswerKey = await res.json();
        const normalized: AnswerKey = {
          ...data,
          paper_id: data.paper_id?.trim() || cleanPaperId,
          key: (data.key || []).map((item) => ({
            question_number: String(item.question_number ?? ""),
            reference_answer:
              item.reference_answer ??
              (item as unknown as { model_answer?: string }).model_answer ??
              "",
            max_score: Number(item.max_score) || 0,
            key_concepts: Array.isArray(item.key_concepts)
              ? item.key_concepts
              : [],
          })),
        };
        setAnswerKey(normalized);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAnswerKey();
  }, [cleanPaperId]);

  const updateQuestion = <K extends keyof QuestionAnswer>(
    index: number,
    field: K,
    value: QuestionAnswer[K]
  ) => {
    if (!answerKey) return;
    const updated = [...answerKey.key];
    updated[index] = { ...updated[index], [field]: value };
    setAnswerKey({ ...answerKey, key: updated });
    setSavedNotice(false);
  };

  const addQuestion = () => {
    if (!answerKey) return;
    setAnswerKey({
      ...answerKey,
      key: [
        ...answerKey.key,
        {
          question_number: `Q${answerKey.key.length + 1}`,
          reference_answer: "",
          max_score: 5,
          key_concepts: [],
        },
      ],
    });
    setSavedNotice(false);
  };

  const removeQuestion = (index: number) => {
    if (!answerKey) return;
    setAnswerKey({
      ...answerKey,
      key: answerKey.key.filter((_, i) => i !== index),
    });
    setSavedNotice(false);
  };

  const handleSave = async () => {
    if (!answerKey) return;
    setIsSaving(true);
    setError(null);
    setSavedNotice(false);

    const payload: AnswerKey = {
      paper_id: answerKey.paper_id.trim() || cleanPaperId,
      key: answerKey.key.map((q) => ({
        question_number: q.question_number.trim(),
        reference_answer: q.reference_answer,
        max_score: Number(q.max_score) || 0,
        key_concepts: q.key_concepts || [],
      })),
    };

    try {
      const res = await fetch(
        `/api/answerKeys/${encodeURIComponent(payload.paper_id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to save answer key.");

      const saved: AnswerKey = await res.json();
      setAnswerKey({
        ...saved,
        paper_id: saved.paper_id?.trim() || payload.paper_id,
      });
      setSavedNotice(true);
      onApproved?.(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteKey = async () => {
    const targetId = (answerKey?.paper_id || cleanPaperId).trim();
    if (!targetId || isDeleting) return;

    const confirmed = window.confirm(
      `Delete the answer key for "${targetId}"?`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);
    setSavedNotice(false);

    try {
      const res = await fetch(
        `/api/answerKeys/${encodeURIComponent(targetId)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          errBody.detail || errBody.error || "Failed to delete answer key."
        );
      }

      setAnswerKey(null);
      onDeleted?.(targetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 border border-slate-700 bg-slate-800 p-5 text-sm text-slate-400 sm:p-7">
        <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
        Loading answer key...
      </div>
    );
  }

  if (!answerKey) {
    return (
      <div className="border border-red-800 bg-slate-800 p-5 text-sm text-red-400 sm:p-7">
        {error || `Answer key not found for "${cleanPaperId}".`}
      </div>
    );
  }

  const totalMarks = answerKey.key.reduce(
    (sum, item) => sum + (Number(item.max_score) || 0),
    0
  );
  const busy = isSaving || isDeleting;

  return (
    <div className="border border-slate-700 bg-slate-800 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Answer key</h2>
          <p className="mt-1 text-sm text-slate-400">
            Review and adjust reference answers before grading. Paper{" "}
            <span className="text-cyan-400">{answerKey.paper_id}</span> • Total
            marks: <span className="text-amber-400">{totalMarks}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={addQuestion}
            disabled={busy}
            className="border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm font-medium text-slate-200 hover:border-cyan-500 hover:text-cyan-400 disabled:opacity-50"
          >
            + Add question
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="border border-cyan-500 bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save & approve"}
          </button>
          <button
            type="button"
            onClick={handleDeleteKey}
            disabled={busy}
            className="inline-flex items-center gap-1.5 border border-red-800/80 bg-red-950/40 px-3.5 py-2 text-sm font-medium text-red-300 hover:border-red-500 hover:bg-red-950/70 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete key"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-5 border border-red-800 bg-red-950/40 px-3.5 py-2.5 text-sm text-red-300">
          {error}
        </div>
      )}

      {savedNotice && (
        <div className="mt-5 border border-cyan-700 bg-cyan-950/40 px-3.5 py-2.5 text-sm text-cyan-300">
          Answer key saved and ready for grading.
        </div>
      )}

      <div className="mt-6 space-y-5">
        {answerKey.key.map((question, index) => (
          <QuestionKeyCard
            key={index}
            index={index}
            question={question}
            onUpdate={(field, value) => updateQuestion(index, field, value)}
            onRemove={() => removeQuestion(index)}
          />
        ))}
      </div>
    </div>
  );
}