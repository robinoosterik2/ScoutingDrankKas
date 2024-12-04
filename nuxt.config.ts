// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
   '@nuxt/image',
   '@nuxt/eslint',
   '@pinia/nuxt',
   '@nuxt/fonts',
   '@nuxtjs/color-mode',
   'nuxt-mongoose',
  ],

  mongoose: {
    options: {},
    modelsDir: 'models',
    devtools: true,
  },

  eslint: {
    // 
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
        classSuffix: '',
    },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})