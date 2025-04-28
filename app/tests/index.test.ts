/* eslint-disable import/first */
// test/index.test.ts
import { setup } from '@nuxt/test-utils'

// Run Nuxt setup once
await setup({
    server: true,
    browser: false,
    env: {
        NODE_ENV: 'development',
        MONGODB_URI: process.env.MONGODB_URI,
    },
    dev: true,
})

// Import all test files (these will be included in the suite)
// import './createUser.test.ts'
import './i18n.test.ts'
// import './cookie.test.js'