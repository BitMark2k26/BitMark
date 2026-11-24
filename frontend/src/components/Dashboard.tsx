import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { AlertTriangle, BrainCircuit, Files } from "lucide-react";
import type { GradingJobSummary } from "../types/type";

const FASTAPI_URL = process.env.FASTAPI_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

type AnswerKeySummary = {
  paper_id: string;
  question_count: number;
  total_marks: number;
};

type BatchRow = {
  paperId: string;
  completed: number;
  total: number;
  flagged: number;
  status: "Action Needed" | "Processing" | "Completed" | "No Submissions";
};

async function getDashboardData() {
  const headers = { "X-API-Key": INTERNAL_API_KEY };

  const [evalRes] = await Promise.all([
    fetch(`${FASTAPI_URL}/api/evaluations`, { headers, cache: "no-store" }).catch(() => null),
  ]);

  const evaluations: GradingJobSummary[] = evalRes?.ok ? await evalRes.json() : [];

  return { evaluations, backendOffline: !evalRes };
}

export default async function Dashboard() {
  await auth.protect();

  const { evaluations, backendOffline } = await getDashboardData();

  const completedEvals = evaluations.filter((e) => e.status === "completed");
  const totalProcessed = completedEvals.length;

  const pendingReview = completedEvals.filter(
    (e) => e.needs_manual_review || e.injection_attempt_detected
  ).length;

  const confidences = completedEvals
    .map((e) => e.overall_confidence)
    .filter((c): c is number => typeof c === "number");

  const avgConfidence =
    confidences.length > 0
      ? `${((confidences.reduce((sum, c) => sum + c, 0) / confidences.length) * 100).toFixed(1)}%`
      : "—";

  // Group evaluations by paper_id and include answer keys with 0 submissions
  const batchMap = new Map<string, { completed: number; total: number; flagged: number; processing: number }>();


  for (const ev of evaluations) {
    const id = ev.paper_id || "Unassigned";
    const entry = batchMap.get(id) ?? { completed: 0, total: 0, flagged: 0, processing: 0 };
    entry.total += 1;
    if (ev.status === "completed") entry.completed += 1;
    if (ev.status === "processing") entry.processing += 1;
    if (ev.needs_manual_review || ev.injection_attempt_detected) entry.flagged += 1;
    batchMap.set(id, entry);
  }

  const activeBatches: BatchRow[] = Array.from(batchMap.entries()).map(([paperId, stats]) => {
    let status: BatchRow["status"] = "No Submissions";
    if (stats.processing > 0) status = "Processing";
    else if (stats.flagged > 0) status = "Action Needed";
    else if (stats.total > 0) status = "Completed";

    return {
      paperId,
      completed: stats.completed,
      total: stats.total,
      flagged: stats.flagged,
      status,
    };
  });

  return (
    <div className="mx-auto w-full max-w-6xl p-8 text-slate-100">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-slate-400">System overview and grading queue.</p>
        </div>
        <div className="flex gap-3 text-sm font-semibold">
          <Link
            href="/generateKey"
            className="border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 transition-colors hover:border-cyan-500"
          >
             New Answer Key
          </Link>
          <Link
            href="/upload"
            className="bg-cyan-500 px-4 py-2 text-slate-950 transition-colors hover:bg-cyan-400"
          >
            Upload Submissions
          </Link>
        </div>
      </header>

      {backendOffline && (
        <div className="mb-6 border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          Could not reach the grading backend. Showing empty state.
        </div>
      )}

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Processed */}
        <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-6">
          <div>
            <p className="mb-1 text-sm font-medium text-slate-400">Total Processed</p>
            <p className="text-3xl font-bold">{totalProcessed}</p>
          </div>
          
        </div>

        {/* Pending Review */}
        <div
          className={`flex items-center justify-between rounded-lg bg-slate-800 p-6 ${
            pendingReview > 0 ? "border-2 border-red-700" : "border border-slate-700"
          }`}
        >
          <div>
            <p className="mb-1 text-sm font-medium text-slate-300">Pending Review</p>
            <p className="text-3xl font-bold">{pendingReview}</p>
          </div>
         
        </div>

        {/* Avg Confidence */}
        <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-6">
          <div>
            <p className="mb-1 text-sm font-medium text-slate-100">
              <strong>Avg Confidence</strong>
            </p>
            <p className="text-3xl font-bold text-emerald-400">{avgConfidence}</p>
          </div>
          
        </div>
      </div>

      {/* Recent Batches Table */}
      <div className="rounded-lg border border-slate-700 bg-slate-800">
        <div className="border-b border-slate-700 px-6 py-4">
          <h2 className="text-lg font-semibold">Recent Batches</h2>
        </div>

        {activeBatches.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-400">
            No batches yet. Upload a question paper to generate your first answer key.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-sm text-slate-400">
                <th className="px-6 py-3 font-medium">Paper / Batch ID</th>
                <th className="px-6 py-3 font-medium">Progress</th>
                <th className="px-6 py-3 font-medium">Flagged</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm">
              {activeBatches.map((batch) => (
                <tr key={batch.paperId} className="hover:bg-slate-700/30">
                  <td className="px-6 py-4 font-medium">{batch.paperId}</td>
                  <td className="px-6 py-4 text-slate-300">
                    {batch.completed}/{batch.total}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{batch.flagged}</td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        batch.status === "Action Needed"
                          ? "font-bold text-red-400"
                          : batch.status === "Completed"
                          ? "font-bold text-emerald-400"
                          : batch.status === "Processing"
                          ? "text-cyan-400"
                          : "text-slate-400"
                      }
                    >
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/review?paperId=${encodeURIComponent(batch.paperId)}`}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}