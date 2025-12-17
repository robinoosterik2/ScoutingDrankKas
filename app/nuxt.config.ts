// https://nuxt.com/docs/api/configuration/nuxt-config

const modules: string[] = [
  "@nuxt/image",
  "@nuxt/fonts",
  ...(process.env.NODE_ENV !== "test" ? ["@nuxtjs/color-mode"] : []),
  "nuxt-auth-utils",
  "@nuxtjs/i18n",
  "@nuxt/test-utils/module",
  "@pinia/nuxt",
];

if (
  process.env.NODE_ENV !== "production" &&
  process.env.DISABLE_NUXT_ESLINT !== "true"
) {
  modules.unshift("@nuxt/eslint");
}

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  build: {},

  vite: {
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
    optimizeDeps: {
      exclude: ["@prisma/engines"],
    },
    ssr: {
      noExternal: ["nodemailer"],
      target: "node",
    },
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
      apiUrl: process.env.API_URL || "http://localhost:3000",
    },
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
    defaultLocale: "nl",
    langDir: "locales",
  },

  nitro: {
    experimental: {
      wasm: true,
    },
    moduleSideEffects: ["@prisma/client"],
    rollupConfig: {
      external: ["@prisma/client", ".prisma", ".prisma/client"],
    },
  },
});
