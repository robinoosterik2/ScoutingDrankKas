import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    testTimeout: 10000,
    setupFiles: ['./tests/utils/setup.ts'],
    environment: 'nuxt',
    globals: true,
    env: {
      MONGODB_URI: process.env.MONGO_TEST_URI,
    },
  }
})
