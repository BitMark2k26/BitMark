"use client";

type PaperDetailsFormProps = {
  paperId: string;
  onPaperIdChange: (value: string) => void;
  disabled?: boolean;
};

const inputClassName =
  "mt-2 w-full border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50";

export function PaperDetailsForm({
  paperId,
  onPaperIdChange,
  disabled = false,
}: PaperDetailsFormProps) {
  return (
    <div className="border border-slate-700 bg-slate-800 p-5 sm:p-7">
      <h2 className="text-lg font-semibold">Paper details</h2>
      <p className="mt-1 text-sm text-slate-400">
        Give this exam paper a unique ID so you can select it later when grading student copies.
      </p>

      <div className="mt-6">
        <label className="block text-sm font-medium">
          Paper ID / Course code <span className="text-amber-400">*</span>
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