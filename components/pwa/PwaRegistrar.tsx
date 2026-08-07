"use client";

import { useEffect } from "react";

/**
 * PwaRegistrar — registers the offline service worker.
 *
 * Only registers in production builds (dev hot-reload and a caching SW
 * fight each other), only on secure contexts (https or localhost — a
 * service worker needs a secure origin by spec), and only where the API
 * exists. Failure is silent: the app works online regardless.
 */
export function PwaRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    if (typeof window === "undefined") return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // Secure-context check failed or registration was refused —
          // BAMBI still works fully online, so just move on.
        });
    };

    // Defer until the page is idle so the SW never competes with first paint.
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(register);
    } else {
      setTimeout(register, 2000);
    }
  }, []);

  return null;
}
