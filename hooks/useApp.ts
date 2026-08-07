"use client";

import { useContext } from "react";
import { AppContext, type AppContextValue } from "@/db/AppContext";

/** Access the BAMBI store: `const { state, api } = useApp()`. */
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside <AppProvider>");
  }
  return ctx;
}
