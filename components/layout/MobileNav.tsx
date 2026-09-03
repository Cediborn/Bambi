"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MoreIcon, SlidersIcon, XIcon } from "@/components/icons";
import { MORE_ITEMS, NAV_ITEMS } from "./nav";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Items pinned to the bottom bar on mobile. */
const PINNED = NAV_ITEMS.filter((item) =>
  ["/today", "/habits", "/focus", "/journal"].includes(item.href)
);

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  // Close the sheet when navigating away (deferred so it never runs
  // synchronously during the render that follows navigation).
  useEffect(() => {
    const t = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  // Dialog focus management: move focus into the sheet when it opens,
  // trap Tab inside it, close on Escape, and restore focus when it closes.
  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    const previous = document.activeElement as HTMLElement | null;
    sheet?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !sheet) return;
      const focusables = sheet.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    sheet?.addEventListener("keydown", onKey);

    return () => {
      sheet?.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open]);

  return (
    <>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-white/[0.06] lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {PINNED.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex flex-col items-center gap-1 py-2 text-[11px] font-semibold",
                  "transition-colors duration-200",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  active ? "" : "text-ink-soft hover:text-ink",
                ].join(" ")}
                style={active ? { color: item.accent } : undefined}
              >
                <span
                  className="flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200"
                  style={active ? { backgroundColor: `${item.accent}14` } : undefined}
                >
                  <Icon size={21} strokeWidth={active ? 2.5 : 2} />
                </span>
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="dialog"
            className={[
              "flex flex-col items-center gap-1 py-2 text-[11px] font-semibold",
              "transition-colors duration-200",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              open ? "text-brand" : "text-ink-soft hover:text-ink",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200",
                open ? "bg-brand/10" : "",
              ].join(" ")}
            >
              {open ? <XIcon size={21} /> : <MoreIcon size={21} />}
            </span>
            {open ? "Close" : "More"}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <>
            {/* Backdrop */}
            <motion.div
              aria-hidden="true"
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            {/* Sheet */}
            <motion.div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="More sections"
              tabIndex={-1}
              className="fixed inset-x-0 bottom-[calc(4.2rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-lg rounded-3xl border border-line bg-card/95 p-4 shadow-lift backdrop-blur-xl dark:border-white/[0.08] lg:hidden"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="grid grid-cols-3 gap-2">
                {MORE_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "flex flex-col items-center gap-2 rounded-2xl px-2 py-4 text-center text-xs font-semibold",
                        "transition-all duration-150",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                        "active:scale-[0.97]",
                        active ? "" : "text-ink-soft hover:bg-surface hover:text-ink",
                      ].join(" ")}
                      style={active ? { backgroundColor: `${item.accent}14`, color: item.accent } : undefined}
                    >
                      <span className="flex size-10 items-center justify-center rounded-xl bg-surface">
                        <Icon size={20} />
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  href="/settings"
                  className={[
                    "flex flex-col items-center gap-2 rounded-2xl px-2 py-4 text-center text-xs font-semibold",
                    "transition-all duration-150",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                    "active:scale-[0.97]",
                    pathname === "/settings" ? "text-brand" : "text-ink-soft hover:bg-surface hover:text-ink",
                  ].join(" ")}
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-surface">
                    <SlidersIcon size={20} />
                  </span>
                  Settings
                </Link>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
