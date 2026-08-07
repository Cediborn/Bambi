"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SparkleField } from "@/components/decor/SparkleField";
import { Toaster } from "@/components/ui/Toasts";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SparkleField />
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar />
        {/* key forces the fade-up transition on every page change */}
        <main
          key={pathname}
          className="animate-fade-up mx-auto w-full max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:px-10 lg:pb-16"
        >
          {children}
        </main>
      </div>
      <MobileNav />
      <Toaster />
    </div>
  );
}
