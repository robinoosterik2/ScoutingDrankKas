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
  },
  mongoose: {
    uri: "mongodb+srv://robinoosterik02:0SW7M6u73hsJJNAD@cluster0.hovok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
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