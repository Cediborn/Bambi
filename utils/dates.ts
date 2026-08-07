/** Date helpers — all dates are "YYYY-MM-DD" local strings. */

export function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Format a Date as a local "YYYY-MM-DD" string. */
export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Today's date as "YYYY-MM-DD" in the user's local timezone. */
export function todayKey(): string {
  return toDateKey(new Date());
}

/** Shift a date key by `days` days (can be negative). */
export function shiftKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return toDateKey(dt);
}

/** Single-letter day label for a date key: e.g. "M". */
export function narrowDayLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "narrow" });
}

export function longDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function fullDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Last `n` date keys ending today, oldest first. */
export function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(shiftKey(todayKey(), -i));
  }
  return out;
}

/** Monday of the week containing `dateKey`, as a YYYY-MM-DD key. */
export function weekKeyOf(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const day = (dt.getDay() + 6) % 7; // Monday = 0
  return toDateKey(new Date(y, m - 1, d - day));
}

/** Greeting based on the current hour. */
export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
