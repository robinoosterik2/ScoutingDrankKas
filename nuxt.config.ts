// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  vite: {
        ssr: {
            noExternal: ['nodemailer']
        }
    },

  modules: [
    "@nuxt/image",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxtjs/color-mode",
    "nuxt-mongoose",
    "nuxt-auth-utils",
    "@nuxtjs/i18n",
    '@nuxt/test-utils/module'
  ],

  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET || "your-secret-here",
    public: {
      // Public environment variables accessible from client and server
      apiUrl: process.env.API_URL || "http://localhost:3000",
    },
    // Server-only environment variables
    mongodb: {
      uri: process.env.MONGODB_URI,
      user: process.env.MONGODB_USER || "drankkas",
      password: process.env.MONGODB_PASSWORD || "drankkas",
      database: process.env.MONGO_INITDB_DATABASE || "drankkas_db",
    },
    sessionPassword: process.env.NUXT_SESSION_PASSWORD || "default-session-password",
  },
  mongoose: {
    uri: process.env.MONGODB_URI,
    options: {
      family: 4,
    },
    modelsDir: "models",
    devtools: true,
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
            { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
            { code: 'nl', iso: 'nl-NL', name: 'Dutch', file: 'nl.json' },
        ],
        lazy: true,
        langDir: 'locales/',
        defaultLocale: 'en',
    bundle: {
      optimizeTranslationDirective: false,
    },
    }
});