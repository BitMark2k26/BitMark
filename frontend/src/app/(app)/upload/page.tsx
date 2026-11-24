"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type StagedFile from "@/types/type";
import { BatchDetailsForm } from "@/components/BatchDetailsForm";
import { UploadFilePicker } from "@/components/UploadFilePicker";
import { UploadSidebar } from "@/components/UploadSidebar";

const pageSteps = ["1", "2", "3"];

type JobResponse = {
  job_id: string;
  status: "processing" | "completed" | "failed";
};

type StagedSubmission = StagedFile & {
  studentName: string;
};

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<StagedSubmission[]>([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [scheme, setScheme] = useState("Default marking scheme");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (incomingFiles: FileList) => {
    const nextFiles: StagedSubmission[] = Array.from(incomingFiles)
      .filter((file) => /\.(pdf|docx?|csv|xlsx)$/i.test(file.name))
      .map((file) => {
        const defaultLabel = file.name.replace(/\.[^/.]+$/, "");
        return {
          id: `${file.name}-${file.lastModified}`,
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          studentName: defaultLabel,
        };
      });

    setFiles((current) => {
      const existingIds = new Set(current.map((file) => file.id));
      return [
        ...current,
        ...nextFiles.filter((file) => !existingIds.has(file.id)),
      ];
    });
  };

  const updateStudentName = (id: string, studentName: string) => {
    setFiles((current) =>
      current.map((item) => (item.id === id ? { ...item, studentName } : item))
    );
  };

  const removeFile = (id: string) => {
    setFiles((current) => current.filter((file) => file.id !== id));
  };

  const handleContinue = async () => {
    const cleanBatch = selectedBatch.trim();
    if (!cleanBatch || files.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const jobIds = await Promise.all(
        files.map(async (staged) => {
          const formData = new FormData();
          formData.append("paper_id", cleanBatch);
          formData.append("file", staged.file);
          if (staged.studentName.trim()) {
            formData.append("student_name", staged.studentName.trim());
          }

          const res = await fetch("/api/uploadFile", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(
              err.detail || err.error || `Failed to upload ${staged.name}`
            );
          }

          const data: JobResponse = await res.json();
          return data.job_id;
        })
      );

      router.push(
        `/review?paperId=${encodeURIComponent(cleanBatch)}&jobs=${jobIds.join(",")}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canContinue = files.length > 0 && selectedBatch.trim().length > 0;

  return (
    <div className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-zinc-200 pb-7 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-400">
              New evaluation
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Upload a batch
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Add student submissions, label each student copy, and select the
              paper ID to begin marking.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            {pageSteps.map((step, index) => (
              <span key={step} className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full font-semibold ${
                    index === 0
                      ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
                      : "border border-zinc-300 dark:border-zinc-800"
                  }`}
                >
                  {step}
                </span>
                {index < pageSteps.length - 1 && (
                  <span className="h-px w-8 bg-zinc-300 dark:bg-zinc-800" />
                )}
              </span>
            ))}
          </div>
        </header>

        {error && (
          <div className="mb-6 border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="space-y-6">
            <div className="border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/80 sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Student submissions</h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    PDF, Word, CSV, or Excel files up to 25 MB each. Set a
                    student copy name for each file.
                  </p>
                </div>
                <span className="hidden rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:block">
                  Required
                </span>
              </div>

              <UploadFilePicker onFilesSelected={addFiles} />

              {files.length > 0 && (
                <div className="mt-5 space-y-3">
                  {files.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/70 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {item.name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {(item.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>

                      <div className="flex items-center gap-2 sm:w-72">
                        <input
                          type="text"
                          value={item.studentName}
                          onChange={(e) =>
                            updateStudentName(item.id, e.target.value)
                          }
                          placeholder="Student copy name / roll no."
                          aria-label={`Student copy name for ${item.name}`}
                          className="w-full border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-cyan-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="border border-zinc-300 bg-white p-2 text-zinc-500 hover:border-rose-500 hover:text-rose-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-rose-500 dark:hover:text-rose-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <BatchDetailsForm
              selectedBatch={selectedBatch}
              scheme={scheme}
              onBatchChange={setSelectedBatch}
              onSchemeChange={setScheme}
            />
          </section>

          <UploadSidebar
            hasFiles={files.length > 0}
            canContinue={canContinue}
            isSubmitting={isSubmitting}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </div>
  );
}