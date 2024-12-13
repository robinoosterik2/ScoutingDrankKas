import en from './locales/en.json'
import nl from './locales/nl.json'

export default defineI18nConfig(() => ({
    // en.json, nl.json
    legacy: false,
    locale: 'nl',
    defaultLocale: 'nl',
    messages: {
        en: en,
        nl: nl,
        },
    lazy: true,
    strategy: 'no_prefix',
  }))
  