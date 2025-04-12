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
    "@pinia/nuxt",
    "@nuxt/fonts",
    "@nuxtjs/color-mode",
    "nuxt-mongoose",
    "nuxt-auth-utils",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
  ],

  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET || "your-secret-here",
    public: {
      // Public environment variables accessible from client and server
      apiUrl: process.env.API_URL || "http://localhost:3000",
    },
    // Server-only environment variables
    mongodb: {
      uri: "mongodb+srv://robinoosterik02:0SW7M6u73hsJJNAD@cluster0.hovok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      user: process.env.MONGODB_USER || "drankkas",
      password: process.env.MONGODB_PASSWORD || "drankkas",
      database: process.env.MONGO_INITDB_DATABASE || "drankkas_db",
    },
    sessionPassword: process.env.NUXT_SESSION_PASSWORD || "default-session-password",
  },
  mongoose: {
    uri: "mongodb+srv://robinoosterik02:0SW7M6u73hsJJNAD@cluster0.hovok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    options: {
      family: "4",
    },
    modelsDir: "models",
    devtools: true,
  },

  eslint: {
    //
  },

  pinia: {
    storesDirs: ["./stores/**"],
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
    vueI18n: "./i18n.config.ts",
  },
});
