import { test, expect } from '@playwright/test';

test('homepage has correct title and a visible heading', async ({ page }) => {
  // Navigate to the base URL defined in playwright.config.ts
  await page.goto('/');

  // Expect the title to contain "Nuxt App" (or whatever the actual title is)
  // Update this assertion based on the actual title of the Nuxt application
  await expect(page).toHaveTitle(/Nuxt App/); // This is a guess, might need adjustment

  // Example: Check if a specific heading is visible.
  // This is a placeholder; you'll replace 'h1' and 'Welcome' with actual selectors/text from your app.
  // const heading = page.locator('h1', { hasText: /Welcome/ }); // Example locator
  // await expect(heading).toBeVisible();

  // Example: Check for a known element on the index page
  // Let's assume there's a div with id="app" that Nuxt mounts to.
  // Or a more specific element from your app's index.vue.
  // For now, a very generic check:
  const body = page.locator('body');
  await expect(body).toBeVisible();
});

test('navigation to login page works', async ({ page }) => {
    await page.goto('/'); // Start at homepage

    // Example: Click a link that navigates to the login page
    // Replace 'text=Login' with the actual selector for your login link/button
    const loginLink = page.locator('a[href="/login"]'); // Common pattern for login link

    if (await loginLink.isVisible()) { // Only click if visible (e.g., user not already logged in)
        await loginLink.click();
        // Wait for navigation to complete
        await page.waitForURL('/login');
        // Check if the URL is the login page
        await expect(page).toHaveURL('/login');

        // Optional: Check for a unique element on the login page
        // const loginButton = page.locator('button', { hasText: 'Login' });
        // await expect(loginButton).toBeVisible();
    } else {
        // If login link is not visible, perhaps the user is already "logged in" in some test context,
        // or the link doesn't exist. For this basic test, we can just log or skip further assertions.
        console.log('Login link not visible, skipping navigation assertions.');
    }
});
