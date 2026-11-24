import Link from "next/link";
import { AnswerKeyWorkspace } from "../../../components/answerKeyWorkspace";

export default function AnswerKeysPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 text-slate-100 sm:px-6">
      <div className="mb-6">
        <h1 className="mt-2 text-2xl font-semibold">Answer keys</h1>
      </div>

      <AnswerKeyWorkspace />
    </main>
  );
}