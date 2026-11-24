import { Suspense } from "react";
import { ReviewWorkspace } from "@/components/reviewWorkspace";

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 p-8 text-sm text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
          Loading review workspace...
        </div>
      }
    >
      <ReviewWorkspace />
    </Suspense>
  );
}