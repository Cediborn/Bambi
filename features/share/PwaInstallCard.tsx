"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CheckIcon,
  DownloadIcon,
  ShareIcon,
  SmartphoneIcon,
} from "@/components/icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** True when the app is already running as an installed PWA. */
function isRunningStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)")?.matches) return true;
  // iOS Safari exposes this non-standard flag inside a saved app.
  const nav = navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
}

function isIos(): boolean {
  return (
    typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent)
  );
}

/**
 * PwaInstallCard — the "Install BAMBI" tile in Settings.
 *
 * On Android/desktop Chrome the browser fires `beforeinstallprompt` when the
 * manifest + service worker are installable; we stash it and let the user opt
 * in with a real button (never auto-prompt). If the app is already installed
 * (running standalone) the card just confirms it. Where no install prompt
 * exists — iOS Safari, or browsers without a prompt event — we show the
 * correct manual recipe instead of a dead end.
 */
export function PwaInstallCard() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Detect an already-installed launch without blocking paint or fighting
    // hydration (deferred one frame, then treated as a state change).
    const raf = window.requestAnimationFrame(() => setInstalled(isRunningStandalone()));

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

    // If BAMBI is installed while the page stays open (installed from the
    // browser menu, or iOS "Add to Home Screen"), the display mode flips.
    const mql = window.matchMedia?.("(display-mode: standalone)");
    const onDisplayMode = (e: MediaQueryListEvent) => {
      setInstalled(e.matches);
      if (e.matches) setDeferred(null);
    };
    mql?.addEventListener?.("change", onDisplayMode);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      mql?.removeEventListener?.("change", onDisplayMode);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  const ios = isIos();
  const canPrompt = deferred !== null;

  return (
    <Card size="featured" tone="indigo">
      <div className="flex items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <SmartphoneIcon size={20} />
        </span>
        <div className="min-w-0">
          <p className="font-bold text-ink">Install BAMBI</p>
          <p className="text-sm text-ink-soft">
            {installed
              ? "BAMBI is on your device. It opens like an app now."
              : canPrompt
                ? "Add BAMBI to your home screen — it opens standalone, full-screen."
                : ios
                  ? "On iPhone or iPad, add BAMBI from the Share menu."
                  : "BAMBI can live on your home screen. Works offline too."}
          </p>
        </div>
        <div className="ml-auto shrink-0">
          {installed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-good/10 px-3 py-1.5 text-xs font-bold text-good">
              <CheckIcon size={13} />
              Installed
            </span>
          ) : canPrompt ? (
            <Button onClick={install} icon={<DownloadIcon size={16} />}>
              Install
            </Button>
          ) : ios ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-info/10 px-3 py-1.5 text-xs font-bold text-info">
              <ShareIcon size={13} />
              Add to Home Screen
            </span>
          ) : null}
        </div>
      </div>

      {!installed ? (
        <div className="mt-5 rounded-2xl bg-surface/60 px-4 py-3.5 text-sm leading-relaxed text-ink-soft dark:bg-white/[0.03]">
          {canPrompt ? (
            <p>Tap <strong className="font-semibold text-ink">Install</strong> and confirm — BAMBI opens in its own window, full-screen and offline.</p>
          ) : ios ? (
            <ol className="list-inside list-decimal space-y-1">
              <li>Open BAMBI in Safari (not another browser).</li>
              <li>Tap <strong className="font-semibold text-ink">Share</strong> <ShareIcon size={13} className="inline" /> at the bottom of the screen.</li>
              <li>Choose <strong className="font-semibold text-ink">Add to Home Screen</strong>, then Add.</li>
            </ol>
          ) : (
            <>
              <p>
                Your browser hasn&apos;t offered an install prompt yet. Use its own menu instead:
              </p>
              <ul className="mt-1.5 list-inside list-disc space-y-1">
                <li>
                  <strong className="font-semibold text-ink">Chrome / Edge:</strong> menu <MoreDots /> → <strong className="font-semibold text-ink">Install app</strong> or <strong className="font-semibold text-ink">Add to Home Screen</strong>.
                </li>
                <li>
                  <strong className="font-semibold text-ink">Firefox / other:</strong> the prompt appears after the page is fully loaded over HTTPS. Try Chrome, Edge or Safari if it stays hidden.
                </li>
              </ul>
            </>
          )}
        </div>
      ) : null}
    </Card>
  );
}

/** Inline ⋯ glyph for the fallback instructions (no extra icon dependency). */
function MoreDots() {
  return (
    <span aria-hidden="true" className="inline-flex translate-y-[-2px] items-center gap-[2px] px-1 align-middle">
      <span className="size-1 rounded-full bg-current" />
      <span className="size-1 rounded-full bg-current" />
      <span className="size-1 rounded-full bg-current" />
    </span>
  );
}
