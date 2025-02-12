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
  },

  mongoose: {
    options: {},
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
