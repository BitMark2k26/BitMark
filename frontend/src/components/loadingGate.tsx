"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function BackendGate({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (res.ok && active) {
          setIsReady(true);
          return;
        }
      } catch {
        // Backend still waking up
      }

      if (active) {
        setTimeout(checkHealth, 3000);
      }
    };

    checkHealth();

    return () => {
      active = false;
    };
  }, []);

  if (!isReady) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-50 px-4 text-center text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600 dark:text-cyan-400" />
        <h2 className="mt-4 text-lg font-semibold">Starting BitMark server...</h2>
        <p className="mt-1 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          The grading backend is waking up from sleep. This can take up to 50 seconds on the first load.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}