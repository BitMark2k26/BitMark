"use client";

import { useState } from "react";

type KeyConceptsInputProps = {
  concepts: string[];
  onChange: (nextConcepts: string[]) => void;
};

export function KeyConceptsInput({ concepts, onChange }: KeyConceptsInputProps) {
  const [draft, setDraft] = useState("");

  const addConcept = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!concepts.includes(trimmed)) {
      onChange([...concepts, trimmed]);
    }
    setDraft("");
  };

  const removeConcept = (index: number) => {
    onChange(concepts.filter((_, i) => i !== index));
  };

  return (
    <div className="sm:col-span-2">
      <span className="block text-sm font-medium">Key concepts</span>

      {concepts.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {concepts.map((concept, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300"
            >
              {concept}
              <button
                type="button"
                onClick={() => removeConcept(index)}
                className="text-cyan-400 hover:text-slate-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addConcept();
            }
          }}
          placeholder="Add concept and press Enter"
          className="w-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        />
        <button
          type="button"
          onClick={addConcept}
          className="border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm font-medium text-slate-200 hover:border-cyan-500 hover:text-cyan-400"
        >
          Add
        </button>
      </div>
    </div>
  );
}