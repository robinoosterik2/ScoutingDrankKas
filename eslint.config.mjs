// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  // do not check 'no-multiple-template-root'
  {
    rules: {
      'vue/no-multiple-template-root': 'off'
    }
  }
)
