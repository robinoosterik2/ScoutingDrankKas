// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  vite: {
    ssr: {
      noExternal: ["nodemailer"],
    },
  },

  modules: [
    "@nuxt/image",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxtjs/color-mode",
    "nuxt-auth-utils",
    "@nuxtjs/i18n",
    "@nuxt/test-utils/module",
  ],

  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET,
    mongodbUri: process.env.MONGODB_URI,
    public: {
      // Public environment variables accessible from client and server
      apiUrl: process.env.API_URL || "http://localhost:3000",
    },
    // Server-only environment variables
    sessionPassword:
      process.env.NUXT_SESSION_PASSWORD || "default-session-password",
  },

  eslint: {
    //
  },

  css: ["~/assets/css/main.css"],

  colorMode: {
    classSuffix: "",
    preference: "dark",
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  i18n: {
    locales: [
      { code: "en", iso: "en-US", name: "English", file: "en.json" },
      { code: "nl", iso: "nl-NL", name: "Dutch", file: "nl.json" },
    ],
    lazy: true,
    langDir: "locales/",
    defaultLocale: "en",
    bundle: {
      optimizeTranslationDirective: false,
    },
  },
});
