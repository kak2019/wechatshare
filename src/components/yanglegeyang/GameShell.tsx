"use client";

import { useEffect } from "react";

interface GameShellProps {
  children: React.ReactNode;
}

export function GameShell({ children }: GameShellProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 touch-manipulation"
      style={{ touchAction: "manipulation" }}
    >
      {children}
    </div>
  );
}
