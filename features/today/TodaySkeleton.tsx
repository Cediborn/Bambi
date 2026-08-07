import { Skeleton } from "@/components/ui/Skeleton";
import { TreeLoadingState } from "@/components/tree/TreeLoadingState";

/**
 * TodaySkeleton — a quiet, page-shaped preview of the Today page.
 *
 * Shown inside the boot overlay for returning users, so the app reads as
 * "content arriving" instead of a logo ritual. Mirrors the real layout:
 * header, focus banner, hero, rhythm card, then the two-column split.
 * The tree slot uses the growing-sprout mark instead of a gray block.
 */
export function TodaySkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10"
    >
      <div className="space-y-6 lg:space-y-10">
        {/* Page header */}
        <div className="space-y-2.5">
          <Skeleton className="h-8 w-32 rounded-xl" />
          <Skeleton className="h-4 w-44 rounded-lg" />
        </div>

        {/* Focus banner */}
        <Skeleton className="h-12 w-full max-w-lg rounded-2xl" />

        {/* Hero */}
        <div className="rounded-3xl border border-line bg-card p-6 shadow-card sm:p-8">
          <div className="grid gap-7 lg:grid-cols-3 lg:gap-10">
            <div className="space-y-3.5 lg:col-span-2">
              <Skeleton className="h-5 w-40 rounded-lg" />
              <Skeleton className="h-9 w-72 max-w-full rounded-xl" />
              <Skeleton className="h-4 w-80 max-w-full rounded-lg" />
              <div className="pt-2">
                <Skeleton className="h-11 w-44 rounded-full" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-5 w-28 rounded-lg" />
              <Skeleton className="h-2.5 w-full rounded-full" />
              <Skeleton className="h-5 w-20 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Rhythm card */}
        <Skeleton className="h-32 w-full rounded-3xl" />

        {/* Two columns */}
        <div className="grid items-start gap-6 lg:grid-cols-5 lg:gap-8">
          <div className="space-y-6 lg:col-span-3">
            {/* Quest */}
            <div className="space-y-3.5 rounded-3xl border border-line bg-card p-5 shadow-card">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-7 w-52 max-w-full rounded-xl" />
              <Skeleton className="h-2.5 w-full rounded-full" />
              <Skeleton className="h-10 w-36 rounded-full" />
            </div>

            {/* Tree — grows instead of shimmering */}
            <div className="flex flex-col items-center rounded-3xl border border-line bg-card p-5 shadow-card">
              <TreeLoadingState />
            </div>

            {/* Today's focus rows */}
            <div className="space-y-5 rounded-3xl border border-line bg-card p-5 shadow-card">
              <Skeleton className="h-4 w-28 rounded-lg" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <Skeleton className="size-6 shrink-0 rounded-full" />
                  <Skeleton className="h-4 flex-1 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            {/* XP */}
            <div className="space-y-3.5 rounded-3xl border border-line bg-card p-5 shadow-card">
              <Skeleton className="h-4 w-20 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-xl" />
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>

            {/* Check-in */}
            <Skeleton className="h-24 w-full rounded-3xl" />

            {/* Week strip */}
            <div className="flex justify-between rounded-3xl border border-line bg-card p-5 shadow-card">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="size-9 rounded-full" />
              ))}
            </div>

            {/* Quote */}
            <Skeleton className="h-28 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
