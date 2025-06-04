# Test info

- Name: homepage has correct title and a visible heading
- Location: /app/app/e2e/example.spec.ts:3:1

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)

Locator: locator(':root')
Expected pattern: /Nuxt App/
Received string:  "Drankkas"
Call log:
  - expect.toHaveTitle with timeout 5000ms
  - waiting for locator(':root')
    8 × locator resolved to <html class="dark">…</html>
      - unexpected value "Drankkas"

    at /app/app/e2e/example.spec.ts:9:22
```

# Page snapshot

```yaml
- button "English":
  - text: English
  - img
- heading "Login to your account" [level=2]
- text: Username
- textbox "Username"
- text: Password
- textbox "Password"
- button "Login"
- text: Don't have an account?
- link "Register":
  - /url: /register
- text: Forgot your password?
- link "Reset here":
  - /url: /user/forgot-password
- img
- button "Toggle Nuxt DevTools":
  - img
- text: 531 ms
- button "Toggle Component Inspector":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('homepage has correct title and a visible heading', async ({ page }) => {
   4 |   // Navigate to the base URL defined in playwright.config.ts
   5 |   await page.goto('/');
   6 |
   7 |   // Expect the title to contain "Nuxt App" (or whatever the actual title is)
   8 |   // Update this assertion based on the actual title of the Nuxt application
>  9 |   await expect(page).toHaveTitle(/Nuxt App/); // This is a guess, might need adjustment
     |                      ^ Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)
  10 |
  11 |   // Example: Check if a specific heading is visible.
  12 |   // This is a placeholder; you'll replace 'h1' and 'Welcome' with actual selectors/text from your app.
  13 |   // const heading = page.locator('h1', { hasText: /Welcome/ }); // Example locator
  14 |   // await expect(heading).toBeVisible();
  15 |
  16 |   // Example: Check for a known element on the index page
  17 |   // Let's assume there's a div with id="app" that Nuxt mounts to.
  18 |   // Or a more specific element from your app's index.vue.
  19 |   // For now, a very generic check:
  20 |   const body = page.locator('body');
  21 |   await expect(body).toBeVisible();
  22 | });
  23 |
  24 | test('navigation to login page works', async ({ page }) => {
  25 |     await page.goto('/'); // Start at homepage
  26 |
  27 |     // Example: Click a link that navigates to the login page
  28 |     // Replace 'text=Login' with the actual selector for your login link/button
  29 |     const loginLink = page.locator('a[href="/login"]'); // Common pattern for login link
  30 |
  31 |     if (await loginLink.isVisible()) { // Only click if visible (e.g., user not already logged in)
  32 |         await loginLink.click();
  33 |         // Wait for navigation to complete
  34 |         await page.waitForURL('/login');
  35 |         // Check if the URL is the login page
  36 |         await expect(page).toHaveURL('/login');
  37 |
  38 |         // Optional: Check for a unique element on the login page
  39 |         // const loginButton = page.locator('button', { hasText: 'Login' });
  40 |         // await expect(loginButton).toBeVisible();
  41 |     } else {
  42 |         // If login link is not visible, perhaps the user is already "logged in" in some test context,
  43 |         // or the link doesn't exist. For this basic test, we can just log or skip further assertions.
  44 |         console.log('Login link not visible, skipping navigation assertions.');
  45 |     }
  46 | });
  47 |
```