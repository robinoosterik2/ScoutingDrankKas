// https://nuxt.com/docs/api/configuration/nuxt-config

const modules: string[] = [
  "@nuxt/image",
  "@nuxt/fonts",
  "@nuxtjs/color-mode",
  "nuxt-auth-utils",
  "@nuxtjs/i18n",
  "@nuxt/test-utils/module",
];

// Only load ESLint module in dev and when not explicitly disabled
if (
  process.env.NODE_ENV !== "production" &&
  process.env.DISABLE_NUXT_ESLINT !== "true"
) {
  modules.unshift("@nuxt/eslint");
}

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  // Build configuration
  build: {},

  // Vite configuration
  vite: {
    // Faster HMR in Docker
    server: {
      watch: {
        usePolling: true,
        interval: 100,
      },
      hmr: {
        protocol: "ws",
        host: "0.0.0.0",
        port: 24678,
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      exclude: ["@prisma/engines"],
    },
    // SSR configuration
    ssr: {
      noExternal: ["nodemailer"],
      // Optimize SSR build
      target: "node",
    },
    // Build optimization
    build: {
      target: "esnext",
      minify: "esbuild",
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["vue", "vue-router"],
          },
        },
      },
    },
  },

  modules,

  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET,
    public: {
      // Public environment variables accessible from client and server
      apiUrl: process.env.API_URL || "http://localhost:3000",
    },
    // Server-only environment variables
    sessionPassword:
      process.env.NUXT_SESSION_PASSWORD || "default-session-password",
  },

  css: ["~/assets/css/main.css"],

  colorMode: {
    classSuffix: "",
    preference: "dark",
  },

  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
      autoprefixer: {},
    },
  },

  i18n: {
    locales: [
      { code: "en", iso: "en-US", name: "English", file: "en.json" },
      { code: "nl", iso: "nl-NL", name: "Dutch", file: "nl.json" },
    ],
    langDir: "locales/",
    defaultLocale: "en",
  },

  nitro: {
    experimental: {
      wasm: true,
    },
    // Keep Prisma client and its internal .prisma folder external during bundling
    // to avoid resolver errors like: Invalid module ".prisma" is not a valid package name
    moduleSideEffects: ["@prisma/client"],
    rollupConfig: {
      external: ["@prisma/client", ".prisma", ".prisma/client"],
    },
  },
});
