import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    // jsdom for everything: the lib tests are environment-agnostic, and one
    // environment is simpler than matching globs.
    environment: "jsdom",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    setupFiles: ["./test/setup.ts"],
    env: {
      // lib/contract.ts reads this at module load. Components under test need
      // a deployed address; the "not live yet" case stubs it out explicitly.
      NEXT_PUBLIC_ART_PLUMBER_ADDRESS:
        "0x64b7363007ce9a918a97fF1102672307215BDEf7",
    },
  },
});
