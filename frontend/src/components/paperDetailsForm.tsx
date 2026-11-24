"use client";

type PaperDetailsFormProps = {
  paperId: string;
  onPaperIdChange: (value: string) => void;
  disabled?: boolean;
};

const inputClassName =
  "mt-2 w-full border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500";

export function PaperDetailsForm({
  paperId,
  onPaperIdChange,
  disabled = false,
}: PaperDetailsFormProps) {
  return (
    <div className="border border-zinc-200 bg-white p-5 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100 sm:p-7">
      <h2 className="text-lg font-semibold">Paper details</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Give this exam paper a unique ID so you can select it later when grading student copies.
      </p>

      <div className="mt-6">
        <label className="block text-sm font-medium">
          Paper ID / Course code <span className="text-amber-600 dark:text-amber-400">*</span>
          <input
            type="text"
            value={paperId}
            onChange={(event) => onPaperIdChange(event.target.value)}
            disabled={disabled}
            placeholder="e.g. CS301-Midterm-2026"
            className={inputClassName}
          />
        </label>
      </div>
    </div>
  );
}