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
      <div className="flex min-h-56 flex-col items-center justify-center border border-zinc-300 bg-zinc-50 px-6 text-center dark:border-zinc-700 dark:bg-zinc-950/60">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
          <FilePlus className="h-7 w-7" />
        </div>
        <p className="font-medium text-zinc-900 dark:text-zinc-100">Choose blank question paper</p>
        <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Upload a single PDF or scan. BitMark will extract the questions and draft an answer key.
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="mt-5 inline-flex items-center gap-2 bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
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
        <div className="flex items-center justify-between border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileText className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
            <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">{file.name}</span>
            <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={onFileRemoved}
            className="ml-3 text-zinc-500 hover:text-rose-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-rose-400"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}