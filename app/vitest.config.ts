import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    testTimeout: 30000,
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/utils/**", "tests/fixtures/**"],
    setupFiles: ["./tests/utils/setup.ts"],
    environment: "nuxt",
    globals: true,
    isolate: true,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    env: {
      DATABASE_URL: "file:./test.db",
      NODE_ENV: "test",
    },
    environmentOptions: {
      nuxt: {
        overrides: {
          runtimeConfig: {
            public: {
              colorMode: {
                preference: "dark",
                value: "dark",
                classSuffix: "",
                forced: false,
                storageKey: "nuxt-color-mode",
              },
            },
          },
        },
      },
    },
  },
});
