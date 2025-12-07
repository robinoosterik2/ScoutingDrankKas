import en from "./locales/en.json";
import nl from "./locales/nl.json";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "nl",
  fallbackLocale: "en",
  messages: {
    en,
    nl,
  },
}));
