import { AlertCircle, ArrowUpFromLine, Info } from "lucide-react";

type UploadSidebarProps = {
  hasFiles: boolean;
  canContinue: boolean;
  isSubmitting?: boolean;
  onContinue: () => void;
};

export function UploadSidebar({
  hasFiles,
  canContinue,
  isSubmitting = false,
  onContinue,
}: UploadSidebarProps) {
  return (
    <aside className="space-y-6">
      <div className="border border-zinc-200 bg-white p-5 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400" />
          <div>
            <h2 className="font-semibold">Before you continue</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              BitMark will process each submission and flag answers below the confidence threshold for manual review.
            </p>
          </div>
        </div>
        <div className="mt-5 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
          <div className="flex items-center justify-between py-2">
            <span className="text-zinc-500 dark:text-zinc-400">Accepted files</span>
            <span className="font-medium">PDF, DOCX, XLSX</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-zinc-500 dark:text-zinc-400">Max file size</span>
            <span className="font-medium">25 MB</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-zinc-500 dark:text-zinc-400">Review threshold</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">75%</span>
          </div>
        </div>
      </div>

      {!hasFiles && (
        <div className="flex gap-3 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>Add at least one submission to continue.</p>
        </div>
      )}

      <button
        type="button"
        disabled={!canContinue || isSubmitting}
        onClick={onContinue}
        className="flex w-full items-center justify-center gap-2 bg-cyan-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
      >
        <ArrowUpFromLine className="h-4 w-4" />
        {isSubmitting ? "Uploading..." : "Continue to review"}
      </button>
      <p className="text-center text-xs text-zinc-500">
        You can change these details before marking begins.
      </p>
    </aside>
  );
}