"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GenerateKeySidebar } from "@/components/generateKeySidebar";
import { PaperDetailsForm } from "@/components/paperDetailsForm";
import { QuestionPaperPicker } from "@/components/questionPaperPicker";

type JobResponse = {
  job_id: string;
  status: "processing" | "completed" | "failed";
  error?: string | null;
};

async function pollJobUntilDone(jobId: string): Promise<void> {
  const maxAttempts = 60;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`);
    if (!res.ok) throw new Error("Failed to check generation status.");

    const job: JobResponse = await res.json();
    if (job.status === "completed") return;
    if (job.status === "failed") {
      throw new Error(job.error || "Answer key generation failed.");
    }
  }

  throw new Error("Generation timed out. Check the Answer Keys page in a moment.");
}

export default function GenerateKeyPage() {
  const router = useRouter();
  const [paperId, setPaperId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(file) && paperId.trim().length > 0;

  const handleGenerate = async () => {
    if (!file || !paperId.trim()) return;

    setError(null);
    setStatusMessage("Uploading paper...");

    try {
      const formData = new FormData();
      formData.append("paper_id", paperId.trim());
      formData.append("file", file);

      const res = await fetch("/api/generateKeys", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || "Failed to upload question paper.");
      }

      const job: JobResponse = await res.json();

      // If FastAPI returned a cached key, skip polling
      if (job.status !== "completed") {
        setStatusMessage("Generating answer key...");
        await pollJobUntilDone(job.job_id);
      }

      router.push("/answerKey");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatusMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-zinc-200 pb-7 dark:border-zinc-800">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-400">
            Answer key setup
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Upload question paper
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Upload a blank exam paper to automatically generate an editable reference answer key.
          </p>
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
                  <h2 className="text-lg font-semibold">Question paper file</h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Single PDF or image scan up to 25 MB.
                  </p>
                </div>
                <span className="hidden rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:block">
                  Required
                </span>
              </div>

              <QuestionPaperPicker
                file={file}
                onFileSelected={setFile}
                onFileRemoved={() => setFile(null)}
                disabled={Boolean(statusMessage)}
              />
            </div>

            <PaperDetailsForm
              paperId={paperId}
              onPaperIdChange={setPaperId}
              disabled={Boolean(statusMessage)}
            />
          </section>

          <GenerateKeySidebar
            hasFile={Boolean(file)}
            canSubmit={canSubmit}
            statusMessage={statusMessage}
            onGenerate={handleGenerate}
          />
        </div>
      </div>
    </div>
  );
}