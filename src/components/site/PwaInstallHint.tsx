"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { PWA } from "@/content/site";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallHint() {
  const pathname = usePathname();
  if (pathname.startsWith("/game/soviet-revival")) return null;

  return <PwaInstallHintInner />;
}

function PwaInstallHintInner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(PWA.installDismissKey) === "1") {
        setDismissed(true);
      } else {
        setDismissed(false);
      }
    } catch {
      setDismissed(false);
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone ===
          true);
    setIsStandalone(standalone);

    function onBip(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (isStandalone || dismissed) return null;

  const isIos =
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !deferred;

  if (!deferred && !isIos) return null;

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(PWA.installDismissKey, "1");
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md sm:left-auto sm:right-6">
      <div className="rounded-2xl border border-black/[0.06] bg-white/95 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.04] backdrop-blur-xl">
        <p className="text-sm font-semibold text-[#1d1d1f]">{PWA.installTitle}</p>
        <p className="mt-1 text-xs leading-relaxed text-[#6e6e73]">
          {isIos ? PWA.installIosHint : PWA.installAndroidHint}
        </p>
        <div className="mt-3 flex gap-2">
          {deferred ? (
            <button
              type="button"
              onClick={() => void install()}
              className="flex-1 rounded-full bg-[#1d1d1f] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-85"
            >
              {PWA.installButton}
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full px-4 py-2 text-xs font-medium text-[#6e6e73] transition-colors hover:bg-[#f5f5f7]"
          >
            {PWA.installDismiss}
          </button>
        </div>
      </div>
    </div>
  );
}
