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
      <div className="border border-slate-700 bg-slate-800 p-5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
          <div>
            <h2 className="font-semibold">How it works</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              BitMark runs OCR on your question paper and generates a structured answer key with key concepts. You can review and edit every answer before grading.
            </p>
          </div>
        </div>
        <div className="mt-5 border-t border-slate-700 pt-4 text-sm">
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400">Accepted files</span>
            <span className="font-medium">PDF, PNG, JPG</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400">Max file size</span>
            <span className="font-medium">25 MB</span>
          </div>
        </div>
      </div>

      {!hasFile && (
        <div className="flex gap-3 border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>Upload a question paper and enter a Paper ID to continue.</p>
        </div>
      )}

      <button
        type="button"
        disabled={!canSubmit || isBusy}
        onClick={onGenerate}
        className="flex w-full items-center justify-center gap-2 bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
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