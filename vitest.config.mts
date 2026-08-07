import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest for BAMBI's pure logic (utils/). The UI is validated by lint,
 * tsc and the production build; these tests pin the math that XP, streaks,
 * quests, the hero and the banner are built on.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "."),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
