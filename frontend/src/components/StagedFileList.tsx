import { CheckCircle2, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import type {StagedFile} from "@/types/type";

type StagedFileListProps = {
  files: StagedFile[];
  onRemove: (id: string) => void;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (fileType: string) =>
  fileType.includes("spreadsheet") || fileType.includes("csv") ? FileSpreadsheet : FileText;

export function StagedFileList({ files, onRemove }: StagedFileListProps) {
  const totalSize = files.reduce((total, file) => total + file.size, 0);

  if (files.length === 0) return null;

  return (
    <div className="mt-5 space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span>{files.length} {files.length === 1 ? "file" : "files"} ready</span>
        <span>{formatFileSize(totalSize)} total</span>
      </div>
      {files.map((file) => {
        const Icon = getFileIcon(file.type);
        return (
          <div key={file.id} className="flex items-center gap-3 border border-slate-700 bg-slate-900/60 px-3 py-3">
            <Icon className="h-5 w-5 shrink-0 text-cyan-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="mt-0.5 text-xs text-slate-400">{formatFileSize(file.size)}</p>
            </div>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <button type="button" onClick={() => onRemove(file.id)} aria-label={`Remove ${file.name}`} className="p-1 text-slate-500 transition-colors hover:text-amber-400">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
