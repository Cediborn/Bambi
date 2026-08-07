"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DownloadIcon, SmartphoneIcon } from "@/components/icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PwaInstallCard — the "install BAMBI on your phone" tile in Settings.
 *
 * On Android/desktop Chrome the browser fires `beforeinstallprompt` when
 * the manifest + service worker are installable; we stash it and let the
 * user opt in with a real button (never auto-prompt). On iOS Safari there
 * is no such event, so we show the manual "Share → Add to Home Screen"
 * recipe instead — a friendly fallback, not a dead end.
 */
export function PwaInstallCard() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  const isIos =
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <Card size="featured" tone="indigo">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <SmartphoneIcon size={20} />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-ink">Install BAMBI</p>
            <p className="text-sm text-ink-soft">
              {installed
                ? "BAMBI is on your device. It opens like an app now."
                : deferred
                  ? "Add BAMBI to your home screen — it opens standalone, full-screen."
                  : "BAMBI can live on your home screen. Works offline too."}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          {installed ? (
            <span className="rounded-full bg-good/10 px-3 py-1.5 text-xs font-bold text-good">
              Installed
            </span>
          ) : deferred ? (
            <Button onClick={install} icon={<DownloadIcon size={16} />}>
              Install
            </Button>
          ) : isIos ? (
            <span className="rounded-full bg-info/10 px-3 py-1.5 text-xs font-bold text-info">
              Share → Add to Home Screen
            </span>
          ) : (
            <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-ink-soft">
              Needs HTTPS or localhost
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
