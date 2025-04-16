import { setup } from '@nuxt/test-utils'

export async function setupNuxtForTest() {
    await setup({
        server: true,
        browser: false,
        env: {
            NODE_ENV: 'development',
            MONGODB_URI: process.env.MONGODB_URI,
        },
        dev: true,
    })
}
