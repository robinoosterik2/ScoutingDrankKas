src/
├── assets/ # Static assets like images, fonts, and icons
├── components/ # Reusable UI components (buttons, cards, modals, etc.)
├── composables/ # Reusable logic using the Composition API (e.g., useFetch)
├── constants/ # Constants like enums, static values, config keys
├── directives/ # Custom Vue directives (e.g., v-click-outside)
├── layouts/ # App-wide layout components (e.g., AdminLayout, DefaultLayout)
├── locales/ # i18n translation files
├── middleware/ # Navigation guards or route-based middleware logic
├── modules/ # Feature-based modules (grouped by domain/feature)
│ └── auth/ # Example module (auth logic, views, store, services)
│ ├── components/ # Auth-specific components (LoginForm, etc.)
│ ├── views/ # Pages related to this module (Login.vue, Register.vue)
│ ├── store/ # Pinia store related to auth
│ ├── services/ # API calls or logic related to auth
│ └── index.ts # Barrel file to export relevant parts of module
├── router/ # Vue Router config and route definitions
├── services/ # Global service clients (e.g., Axios instances)
├── store/ # Global Pinia stores (e.g., userStore, settingsStore)
├── styles/ # Global styles, tailwind config, SCSS variables, etc.
├── types/ # Global TypeScript types/interfaces
├── utils/ # General-purpose utilities and helpers
├── views/ # High-level route components (if not module-scoped)
├── App.vue # Root Vue component
├── main.ts # App entry point (creates Vue app, sets up router/store)
└── shims-vue.d.ts # TypeScript support for \*.vue files

assets/ Static files like logos, icons, images, or fonts. Vite handles importing them efficiently.

components/ Global reusable Vue components that are not tied to a specific feature/module. Think BaseButton, AppModal, etc.

composables/ Contains custom Composition API functions (like useDarkMode, usePagination). This promotes logic reuse.

constants/ Environment-based values, role definitions, status enums, etc.

directives/ Custom Vue 3 directives like v-autofocus, v-intersect, etc.

layouts/ High-level layout shells such as AdminLayout, GuestLayout, etc., used in <router-view> with named slots.

locales/ Translation JSON files and i18n config. Supports multiple languages.

middleware/ Middleware-style logic run during route navigation. Common in SSR or route guarding (auth, roles, etc.).

modules/ Main directory for feature modules. Keeps each feature self-contained (UI, logic, store, API). Helps with scaling.

router/ Vue Router instance setup, route guards, dynamic imports. Routes can import from modules or define globally.

services/ Axios or Fetch client, HTTP interceptors, or global data fetching logic (like api.ts). Also ideal for third-party integrations.

store/ Global Pinia stores not tied to a specific feature. For example, userStore.ts, uiStore.ts.

styles/ Global styles, utility classes, CSS reset, Tailwind config (if used), theme tokens.

types/ Global TypeScript types, interfaces, or declaration files. Can also include API response types.

utils/ General helpers (e.g., formatDate, debounce, slugify, etc.) used across features.

views/ Route-level Vue components if not using modules. Otherwise handled inside modules/<feature>/views/.

App.vue Root component containing layout shell and root-level logic.

main.ts Entry point: initializes Vue app, router, store, plugins, and mounts the app.

shims-vue.d.ts TS definition file to allow imports of .vue files in TypeScript.
