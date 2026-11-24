"use client";

import { AlertCircle, Info, Loader2, Sparkles } from "lucide-react";

type GenerateKeySidebarProps = {
  hasFile: boolean;
  canSubmit: boolean;
  statusMessage: string | null;
  onGenerate: () => void;
};

export function GenerateKeySidebar({
  hasFile,
  canSubmit,
  statusMessage,
  onGenerate,
}: GenerateKeySidebarProps) {
  const isBusy = Boolean(statusMessage);

  return (
    <aside className="space-y-6">
      <div className="border border-zinc-200 bg-white p-5 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400" />
          <div>
            <h2 className="font-semibold">How it works</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              BitMark runs OCR on your question paper and generates a structured answer key with key concepts. You can review and edit every answer before grading.
            </p>
          </div>
        </div>
        <div className="mt-5 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
          <div className="flex items-center justify-between py-2">
            <span className="text-zinc-500 dark:text-zinc-400">Accepted files</span>
            <span className="font-medium">PDF, PNG, JPG</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-zinc-500 dark:text-zinc-400">Max file size</span>
            <span className="font-medium">25 MB</span>
          </div>
        </div>
      </div>

      {!hasFile && (
        <div className="flex gap-3 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>Upload a question paper and enter a Paper ID to continue.</p>
        </div>
      )}

      <button
        type="button"
        disabled={!canSubmit || isBusy}
        onClick={onGenerate}
        className="flex w-full items-center justify-center gap-2 bg-cyan-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
      >
        {isBusy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {statusMessage}
          </>
        ) : (
          <>
            Generate answer key
          </>
        )}
      </button>
    </aside>
  );
}