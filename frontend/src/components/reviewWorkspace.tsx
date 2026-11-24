"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { EvaluationEditor } from "./evaluationEditor";
import { SubmissionList } from "./submissionList";
import type {
  GradingJobSummary,
  JobDetailResponse,
  PaperEvaluation,
} from "../types/type";

export function ReviewWorkspace() {
  const searchParams = useSearchParams();
  const paperIdParam = searchParams.get("paperId")?.trim() || "";
  const jobsParam = searchParams.get("jobs")?.trim() || "";

  const [jobs, setJobs] = useState<GradingJobSummary[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<JobDetailResponse | null>(null);
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchJobList = useCallback(async () => {
    setErrorMessage(null);
    try {
      const query = paperIdParam
        ? `?paperId=${encodeURIComponent(paperIdParam)}`
        : "";
      const res = await fetch(`/api/evaluation${query}`, { cache: "no-store" });
      if (!res.ok) {
        setErrorMessage(`Failed to load evaluations (${res.status}).`);
        return;
      }

      let list: GradingJobSummary[] = await res.json();

      if (jobsParam) {
        const allowed = new Set(
          jobsParam
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        );
        const filtered = list.filter((item) => allowed.has(item.job_id));
        if (filtered.length > 0) list = filtered;
      }

      setJobs(list);
      setSelectedJobId((current) => {
        if (current && list.some((item) => item.job_id === current)) {
          return current;
        }
        return list[0]?.job_id ?? null;
      });
    } catch {
      setErrorMessage("Network error while loading evaluations.");
    } finally {
      setIsLoadingList(false);
    }
  }, [paperIdParam, jobsParam]);

  const fetchSelectedDetail = useCallback(async (jobId: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const detail: JobDetailResponse = await res.json();
      setSelectedDetail(detail);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    fetchJobList();
  }, [fetchJobList]);

  useEffect(() => {
    if (selectedJobId) {
      fetchSelectedDetail(selectedJobId);
    } else {
      setSelectedDetail(null);
    }
  }, [selectedJobId, fetchSelectedDetail]);

  useEffect(() => {
    const hasProcessing = jobs.some((j) => j.status === "processing");
    if (!hasProcessing) return;

    const timer = setInterval(() => {
      fetchJobList();
      if (selectedJobId) fetchSelectedDetail(selectedJobId);
    }, 3000);

    return () => clearInterval(timer);
  }, [jobs, selectedJobId, fetchJobList, fetchSelectedDetail]);

  const handleSaved = (jobId: string, updated: PaperEvaluation) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.job_id === jobId
          ? {
              ...j,
              total_score: updated.total_score,
              max_total_score: updated.max_total_score,
              needs_manual_review: updated.needs_manual_review,
              review_reason: updated.review_reason,
            }
          : j
      )
    );
    setSelectedDetail((prev) =>
      prev && prev.job_id === jobId ? { ...prev, result: updated } : prev
    );
  };

  const handleDeleteJob = async (jobId: string) => {
    if (deletingJobId) return;
    setDeletingJobId(jobId);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(
          err.detail || err.error || `Failed to delete submission (${res.status}).`
        );
        return;
      }

      setJobs((prev) => {
        const next = prev.filter((j) => j.job_id !== jobId);
        if (selectedJobId === jobId) {
          setSelectedJobId(next[0]?.job_id ?? null);
          setSelectedDetail(null);
        }
        return next;
      });
    } catch {
      setErrorMessage("Network error while deleting submission.");
    } finally {
      setDeletingJobId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 px-5 py-8 text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-700 pb-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
              Grading Review
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Student Evaluations
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Inspect confidence scores, review flagged papers (&lt; 75%), and override marks.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsLoadingList(true);
              fetchJobList();
            }}
            className="inline-flex items-center gap-2 border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-cyan-500"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </header>

        {errorMessage ? (
          <div className="mb-6 border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
            {errorMessage}
          </div>
        ) : null}

        {isLoadingList ? (
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            Loading evaluations...
          </div>
        ) : jobs.length === 0 ? (
          <div className="border border-slate-700 bg-slate-800 p-8 text-sm text-slate-400">
            No grading jobs found
            {paperIdParam ? ` for paper "${paperIdParam}"` : ""}. Upload a student
            submission first to start grading.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <SubmissionList
              jobs={jobs}
              selectedJobId={selectedJobId}
              showFlaggedOnly={showFlaggedOnly}
              deletingJobId={deletingJobId}
              onToggleFlagged={setShowFlaggedOnly}
              onSelect={setSelectedJobId}
              onDelete={handleDeleteJob}
            />

            <section>
              {!selectedJobId ? (
                <div className="border border-slate-700 bg-slate-800 p-8 text-sm text-slate-400">
                  Select a submission from the left to inspect its marks.
                </div>
              ) : isLoadingDetail && !selectedDetail ? (
                <div className="flex items-center gap-3 border border-slate-700 bg-slate-800 p-8 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  Loading paper evaluation...
                </div>
              ) : selectedDetail?.status === "processing" ? (
                <div className="flex items-center gap-3 border border-slate-700 bg-slate-800 p-8 text-sm text-cyan-300">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  OCR and LLM grading in progress. This view updates automatically...
                </div>
              ) : selectedDetail?.status === "failed" ? (
                <div className="border border-red-800 bg-red-950/40 p-6 text-sm text-red-300">
                  Grading failed: {selectedDetail.error || "Unknown error"}
                </div>
              ) : selectedDetail?.result ? (
                <EvaluationEditor
                  jobId={selectedDetail.job_id}
                  evaluation={selectedDetail.result}
                  onSaved={handleSaved}
                />
              ) : null}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}