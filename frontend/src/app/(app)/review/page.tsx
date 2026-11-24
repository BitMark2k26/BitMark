import { Suspense } from "react";
import { ReviewWorkspace } from "@/components/reviewWorkspace";

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 p-8 text-sm text-slate-400">
          Loading review workspace...
        </div>
      }
    >
      <ReviewWorkspace />
    </Suspense>
  );
}