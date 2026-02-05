/**
 * Vitest configuration for billclaw tests
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.test.ts",
        "**/*.d.ts",
      ],
    },
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});