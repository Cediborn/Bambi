"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, DEFAULT_AVATAR } from "@/components/ui/Avatar";
import { SlidersIcon } from "@/components/icons";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/hooks/useApp";
import { NAV_ITEMS } from "./nav";

/**
 * Desktop sidebar. Each item carries its own accent color, so the active
 * state gets a small colored bar + tinted label instead of one generic
 * highlight — every section keeps its own temperature.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { state } = useApp();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-card/70 backdrop-blur-xl dark:border-white/[0.06] dark:bg-white/[0.02] lg:flex">
      <Link
        href="/today"
        className="flex items-center gap-3 px-6 pb-6 pt-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <BrandLogo size={36} />
        <span className="font-display text-xl font-extrabold tracking-tight text-ink">
          BAMBI
        </span>
      </Link>

      <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto px-4 pb-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold",
                "transition-all duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                active
                  ? ""
                  : "text-ink-soft hover:translate-x-0.5 hover:bg-surface hover:text-ink",
              ].join(" ")}
              style={
                active
                  ? {
                      backgroundColor: `${item.accent}14`,
                      color: item.accent,
                    }
                  : undefined
              }
            >
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full transition-all duration-200"
                  style={{ backgroundColor: item.accent }}
                />
              ) : null}
              <Icon
                size={19}
                strokeWidth={active ? 2.5 : 2}
                className="shrink-0 transition-colors duration-200"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-4 py-4 dark:border-white/[0.06]">
        {/* Your buddy — who's growing in here */}
        <div className="mb-1 flex items-center gap-3 rounded-xl px-2 py-1.5">
          <Avatar avatar={state.profile?.avatar ?? DEFAULT_AVATAR} size={36} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{state.profile?.name ?? "friend"}</p>
            <p className="text-[11px] text-ink-soft">Growing daily</p>
          </div>
        </div>
        <Link
          href="/settings"
          aria-current={pathname === "/settings" ? "page" : undefined}
          className={[
            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold",
            "transition-all duration-200",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            pathname === "/settings"
              ? "text-brand"
              : "text-ink-soft hover:translate-x-0.5 hover:bg-surface hover:text-ink",
          ].join(" ")}
        >
          {pathname === "/settings" ? (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-brand"
            />
          ) : null}
          <SlidersIcon
            size={19}
            strokeWidth={pathname === "/settings" ? 2.5 : 2}
            className="shrink-0"
          />
          Settings
        </Link>
      </div>
    </aside>
  );
}
