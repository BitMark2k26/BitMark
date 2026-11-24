"use client";

import { ChangeEvent, useRef } from "react";
import { FilePlus, FileText, Plus, X } from "lucide-react";

const acceptedTypes = ".pdf,.png,.jpg,.jpeg";

type QuestionPaperPickerProps = {
  file: File | null;
  onFileSelected: (file: File) => void;
  onFileRemoved: () => void;
  disabled?: boolean;
};

export function QuestionPaperPicker({
  file,
  onFileSelected,
  onFileRemoved,
  disabled = false,
}: QuestionPaperPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) onFileSelected(selected);
    event.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex min-h-56 flex-col items-center justify-center border border-slate-600 bg-slate-900/40 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
          <FilePlus className="h-7 w-7" />
        </div>
        <p className="font-medium">Choose blank question paper</p>
        <p className="mt-2 max-w-sm text-sm text-slate-400">
          Upload a single PDF or scan. BitMark will extract the questions and draft an answer key.
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="mt-5 inline-flex items-center gap-2 bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
        >
          <Plus className="h-4 w-4" /> {file ? "Replace file" : "Browse file"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          className="sr-only"
        />
      </div>

      {file && (
        <div className="flex items-center justify-between border border-slate-700 bg-slate-900 px-4 py-3 text-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileText className="h-4 w-4 shrink-0 text-cyan-400" />
            <span className="truncate font-medium text-slate-100">{file.name}</span>
            <span className="shrink-0 text-xs text-slate-400">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={onFileRemoved}
            className="ml-3 text-slate-400 hover:text-red-400 disabled:opacity-50"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}