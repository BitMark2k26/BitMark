"use client";

import { ChangeEvent, useRef } from "react";
import { FilePlus, Plus } from "lucide-react";

const acceptedTypes = ".pdf,.doc,.docx,.csv,.xlsx";

type UploadFilePickerProps = {
  onFilesSelected: (files: FileList) => void;
};

export function UploadFilePicker({ onFilesSelected }: UploadFilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) onFilesSelected(event.target.files);
    event.target.value = "";
  };

  return (
    <div className="flex min-h-64 flex-col items-center justify-center border border-slate-600 bg-slate-900/40 px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
        <FilePlus className="h-7 w-7" />
      </div>
      <p className="font-medium">Choose student submissions</p>
      <p className="mt-2 max-w-sm text-sm text-slate-400">Select one or more files from your computer to add them to this batch.</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-5 inline-flex items-center gap-2 bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800"
      >
        <Plus className="h-4 w-4" /> Browse files
      </button>
      <input ref={inputRef} type="file" multiple accept={acceptedTypes} onChange={handleFileChange} className="sr-only" />
    </div>
  );
}
