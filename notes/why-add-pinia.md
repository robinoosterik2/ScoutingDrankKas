# Why Pinia Would Benefit ScoutingDrankKas

## Project context
- The app is a Nuxt 3 monorepo that lives under `/app`, with shared composables, middleware, and Vue single-file components.
- Client state is currently managed with local `ref`/`computed` declarations and per-screen `$fetch` calls rather than a centralized store.

## Current state observations
1. **Session-dependent UI sprinkled across layout and pages** – the default layout gates navigation links on `useUserSession()` data, but every page that needs user/session info calls the same composable independently, e.g. the root ordering flow and profile page both pull user data separately (@app/layouts/default.vue#1-42, @app/pages/index.vue#150-380, @app/pages/user/profile.vue#125-200).
2. **Data-heavy screens re-create large reactive trees** – the ordering dashboard spawns many `ref` objects for users, products, categories, and per-product counts, duplicating this setup on every navigation (@app/pages/index.vue#150-380).
3. **Admin finance view coordinates several asynchronous fetches and manual loading/error tracking for each section**, which makes reuse difficult and error-prone if more dashboards are added (@app/pages/admin/finances/index.vue#360-479).
4. **Admin user management handles modal visibility, selections, and optimistic updates locally**, leading to repeated patterns that would benefit from shared store logic (@app/pages/admin/users/index.vue#240-300).
5. There is **no Pinia dependency or Nuxt module configured** today, so state sharing relies on ad-hoc composables and cross-component props (@app/package.json#1-61, @app/nuxt.config.ts#1-132).

## Pain points caused by the current approach
- **Duplicate network requests**: Each view fetches foundational data independently (session info, users, products), increasing latency and risking stale state when multiple components mutate overlapping resources.
- **Complex orchestration logic inside components**: Screens mix business rules with view logic (e.g., manual loading state matrices in finances, ad-hoc optimistic updates in admin users), making components harder to test and extend.
- **Limited cross-feature communication**: When one view updates collections such as users or orders, other views have no reactive way to respond, so the UX relies on full page refreshes or manual re-fetches.
- **Testing friction**: Isolating and unit-testing data logic requires stubbing composables or API calls per component, whereas store actions/getters can be tested in isolation.

## How Pinia addresses these gaps
1. **Single source of truth** – Pinia stores give layouts, pages, and components a shared reactive state, eliminating repeated `useUserSession()` fetches and aligning derived data such as available years or balances.
2. **Action-based data orchestration** – Async actions centralize `$fetch` calls (e.g., finance summaries, user mutations), so components only react to store state and stay presentation-focused.
3. **Optimistic updates & caching** – Stores can manage optimistic mutations and reconcile responses once, allowing admin pages to reuse logic without duplicating modal bookkeeping.
4. **Devtools & hydration** – Pinia integrates with Vue Devtools for time-travel/debugging, and `@pinia/nuxt` automatically handles SSR hydration, which suits this Nuxt 3 setup.
5. **Type safety** – With the existing TypeScript toolchain, Pinia’s typed stores provide strongly-typed state, getters, and actions, reducing runtime errors.

## Implementation outline
1. **Install and register Pinia**: `pnpm add pinia @pinia/nuxt` and add `"@pinia/nuxt"` to the `modules` array, enabling auto-imported stores.
2. **Create domain-focused stores**:
   - `useSessionStore` to wrap authentication/session logic currently spread across middleware and layouts.
   - `useInventoryStore` for products, categories, and pricing data used on the ordering dashboard.
   - `useFinanceStore` to encapsulate the finance summary, loading, and error matrices.
   - `useUserAdminStore` to coordinate admin user fetches, sorting, and optimistic updates.
3. **Gradually migrate components**: Move data-fetching and mutation logic into store actions, inject stores via `const store = useSessionStore()`, and keep components focused on presentation.
4. **Leverage Nuxt auto-imports and server routes**: Stores can call the existing `/api/*` endpoints; middleware can await store actions to ensure consistent state before navigation.
5. **Add targeted tests**: Use Vitest to cover critical store actions (e.g., placing orders, updating balances), reducing the need for broad component tests.

## Expected outcomes
- Fewer redundant API calls and more predictable caching of foundational data.
- Cleaner components with easier-to-follow templates and logic.
- Simplified onboarding for contributors thanks to centralized, typed state definitions.
- A more reactive UX where updates propagate automatically across admin and user-facing screens.

## Suggested next steps
1. Introduce Pinia dependencies and the Nuxt module, then scaffold a session store as a proof of concept.
2. Refactor the ordering dashboard to consume the new stores, validating reduced fetch duplication.
3. Expand to admin domains, retiring duplicated loading/error handling in favor of reusable store state.
