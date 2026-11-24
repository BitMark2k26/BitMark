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
      <div className="border border-slate-700 bg-slate-800 p-5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
          <div>
            <h2 className="font-semibold">Before you continue</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              BitMark will process each submission and flag answers below the confidence threshold for manual review.
            </p>
          </div>
        </div>
        <div className="mt-5 border-t border-slate-700 pt-4 text-sm">
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400">Accepted files</span>
            <span className="font-medium">PDF, DOCX, XLSX</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400">Max file size</span>
            <span className="font-medium">25 MB</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400">Review threshold</span>
            <span className="font-medium text-amber-400">75%</span>
          </div>
        </div>
      </div>

      {!hasFiles && (
        <div className="flex gap-3 border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>Add at least one submission to continue.</p>
        </div>
      )}

      <button
        type="button"
        disabled={!canContinue || isSubmitting}
        onClick={onContinue}
        className="flex w-full items-center justify-center gap-2 bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
      >
        <ArrowUpFromLine className="h-4 w-4" />
        {isSubmitting ? "Uploading..." : "Continue to review"}
      </button>
      <p className="text-center text-xs text-slate-500">
        You can change these details before marking begins.
      </p>
    </aside>
  );
}