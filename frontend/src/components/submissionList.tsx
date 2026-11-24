"use client";

import { AlertTriangle, Loader2, ShieldAlert, Trash2 } from "lucide-react";
import type { GradingJobSummary } from "../types/type";

type SubmissionListProps = {
  jobs: GradingJobSummary[];
  selectedJobId: string | null;
  showFlaggedOnly: boolean;
  deletingJobId?: string | null;
  onToggleFlagged: (value: boolean) => void;
  onSelect: (jobId: string) => void;
  onDelete: (jobId: string) => void;
};

export function SubmissionList({
  jobs,
  selectedJobId,
  showFlaggedOnly,
  deletingJobId = null,
  onToggleFlagged,
  onSelect,
  onDelete,
}: SubmissionListProps) {
  const flaggedCount = jobs.filter((j) => j.needs_manual_review).length;
  const visibleJobs = showFlaggedOnly
    ? jobs.filter((j) => j.needs_manual_review)
    : jobs;

  return (
    <aside className="border border-slate-700 bg-slate-800">
      <div className="border-b border-slate-700 p-4">
        <h2 className="text-sm font-semibold text-slate-100">
          Submissions ({jobs.length})
        </h2>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => onToggleFlagged(false)}
            className={`flex-1 border px-2.5 py-1.5 text-xs font-medium ${
              !showFlaggedOnly
                ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                : "border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onToggleFlagged(true)}
            className={`flex-1 border px-2.5 py-1.5 text-xs font-medium ${
              showFlaggedOnly
                ? "border-amber-500 bg-amber-500/15 text-amber-300"
                : "border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            Needs Review ({flaggedCount})
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-700/80">
        {visibleJobs.length === 0 ? (
          <div className="p-4 text-xs text-slate-400">
            No submissions match this filter.
          </div>
        ) : (
          visibleJobs.map((job) => {
            const isSelected = job.job_id === selectedJobId;
            const isDeleting = job.job_id === deletingJobId;
            const displayName =
              job.student_name?.trim() || `${job.job_id.slice(0, 8)}...`;

            return (
              <div
                key={job.job_id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(job.job_id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(job.job_id);
                  }
                }}
                className={`flex cursor-pointer items-start justify-between gap-2 p-4 transition-colors ${
                  isSelected
                    ? "bg-slate-900/90 border-l-2 border-l-cyan-400"
                    : "hover:bg-slate-900/50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-100">
                      {displayName}
                    </p>
                    {job.injection_attempt_detected && (
                      <ShieldAlert
                        className="h-3.5 w-3.5 shrink-0 text-red-400"
                        aria-label="Prompt injection detected"
                      />
                    )}
                    {job.needs_manual_review && (
                      <AlertTriangle
                        className="h-3.5 w-3.5 shrink-0 text-amber-400"
                        aria-label="Needs manual review"
                      />
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    {job.status === "processing" ? (
                      <span className="inline-flex items-center gap-1 text-cyan-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Processing...
                      </span>
                    ) : job.status === "failed" ? (
                      <span className="text-red-400">Failed</span>
                    ) : (
                      <span>
                        Score:{" "}
                        <strong className="text-slate-200">
                          {job.total_score ?? 0} / {job.max_total_score ?? 0}
                        </strong>
                      </span>
                    )}

                    {typeof job.overall_confidence === "number" && (
                      <span>
                        · {Math.round(job.overall_confidence * 100)}%
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(job.job_id);
                  }}
                  aria-label={`Delete submission ${displayName}`}
                  className="shrink-0 p-1.5 text-slate-400 hover:text-red-400 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}