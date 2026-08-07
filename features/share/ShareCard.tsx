"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CheckIcon,
  CopyIcon,
  ShareIcon,
  SmartphoneIcon,
} from "@/components/icons";

type QrStatus = "loading" | "ready" | "error";

/**
 * The best URL to share: on a deployed (public) origin — http or https —
 * the browser's own origin wins (that's the address a visitor can reach
 * from anywhere). Only when we're on localhost does the LAN-address API
 * matter, because that's the URL a phone on the same Wi-Fi can open.
 */
function bestShareUrl(lanUrl: string | null): string | null {
  const here = window.location.origin;
  const isLocalhost =
    here.includes("localhost") ||
    here.startsWith("http://127.") ||
    here.startsWith("http://0.0.0.0") ||
    here.startsWith("http://[::1]");
  return isLocalhost ? lanUrl : here;
}

/**
 * "Open on your phone" tile. Encodes this computer's LAN address into a QR
 * code — scan it with a phone camera (same Wi-Fi) and BAMBI opens instantly.
 */
export function ShareCard() {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<QrStatus>("loading");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/lan-address")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("no lan"))))
      .then((data: { url?: string | null }) => {
        if (cancelled) return;
        const next = bestShareUrl(data.url ?? null);
        setUrl(next);
        setStatus(next ? "ready" : "error");
      })
      .catch(() => {
        if (cancelled) return;
        const url = bestShareUrl(null);
        setUrl(url);
        setStatus(url ? "ready" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status !== "ready" || !url || !canvasRef.current) return;
    void QRCode.toCanvas(canvasRef.current, url, {
      width: 168,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#111827", light: "#FFFFFF" },
    });
  }, [url, status]);

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard needs a secure context; the visible URL can be copied by hand.
    }
  };

  return (
    <Card size="featured">
      <div className="flex items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface text-ink-soft">
          <SmartphoneIcon size={20} />
        </span>
        <div>
          <p className="font-bold text-ink">Open on your phone</p>
          <p className="text-sm text-ink-soft">
            {url?.startsWith("http://") ? "Same Wi-Fi network required — scan the code." : "Live on the web — works anywhere."}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* QR code on a white tile so it always scans */}
        <div className="shrink-0 rounded-2xl bg-white p-2.5 shadow-card ring-1 ring-line dark:ring-white/10">
          {status === "ready" && url ? (
            <canvas ref={canvasRef} width={168} height={168} className="block rounded-lg" />
          ) : (
            <div className="flex size-[168px] items-center justify-center rounded-lg bg-line/50">
              {status === "loading" ? (
                <span className="animate-pulse text-xs font-semibold text-ink-soft">
                  Finding your address…
                </span>
              ) : (
                <span className="max-w-[140px] text-center text-xs font-semibold text-ink-soft">
                  Couldn&apos;t find this computer&apos;s network address.
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {url ? (
            <>
              <p
                className="font-mono w-full break-all rounded-xl border border-line bg-surface px-3.5 py-2.5 text-xs font-semibold text-ink"
                title={url}
              >
                {url}
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Button onClick={copy} icon={copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}>
                  {copied ? "Copied" : "Copy link"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                  icon={<ShareIcon size={16} />}
                >
                  Open here
                </Button>
              </div>
              <p className="text-xs leading-relaxed text-ink-soft">
                Point your phone camera at the code — no typing, no app needed.
                The address changes if this computer joins a different network.
              </p>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-ink-soft">
              If this computer has no accessible network address, open the app
              from the browser on your phone instead.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
