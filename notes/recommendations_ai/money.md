# Handling Monetary Values (Cents and Euros)

This document outlines the recommended approach for handling monetary values in the application. The backend stores all currency as integers in cents to avoid floating-point inaccuracies, while the frontend must display and accept values in euros.

## The Problem

-   **Backend:** Stores money as `Integer` (e.g., `1234`) representing cents. This is the correct and safe way to avoid floating-point math errors.
-   **Frontend:** Needs to display this value to the user in a human-readable format (e.g., `€12.34`).
-   **User Input:** Users will enter values in euros (e.g., `12.34` or `12,34`). This input needs to be reliably converted back to an integer of cents before being sent to the backend.

## Recommended Solution: `useMoney` Composable

The best practice in a Nuxt 3 application is to create a reusable **composable** to handle all conversions. This centralizes the logic, makes it easy to reuse across components, and ensures consistency.

### Implementation

Create a file at `composables/useMoney.ts`:

```typescript
import { useI18n } from 'vue-i18n'

export const useMoney = () => {
  const { locale } = useI18n()

  /**
   * Formats a number in cents into a localized currency string.
   * @param cents The amount in cents (e.g., 1234)
   * @returns A formatted currency string (e.g., "€12.34")
   */
  const format = (cents: number | null | undefined): string => {
    if (cents === null || cents === undefined) {
      cents = 0
    }
    const amountInEuros = cents / 100
    // Leverage nuxt-i18n's locale to format the currency correctly
    // for the user's language (e.g., using . or , as decimal separator)
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: 'EUR',
    }).format(amountInEuros)
  }

  /**
   * Parses a string or number representing euros into cents.
   * @param euroValue The value in euros (e.g., "12,34" or 12.34)
   * @returns The amount in cents as an integer (e.g., 1234)
   */
  const parse = (euroValue: string | number | null | undefined): number => {
    if (euroValue === null || euroValue === undefined) {
      return 0
    }

    // Convert to string, replace comma with dot for universal parsing
    const cleanString = String(euroValue).replace(',', '.')

    // Remove anything that is not a digit or a decimal point
    const sanitizedString = cleanString.replace(/[^\d.]/g, '')

    const parsedFloat = parseFloat(sanitizedString)

    if (isNaN(parsedFloat)) {
      return 0
    }

    // Convert to cents and round to avoid floating point inaccuracies
    return Math.round(parsedFloat * 100)
  }

  return { format, parse }
}
```

### How to Use It

Nuxt 3 will automatically import this composable. You can use it in any component or page.

#### 1. Displaying Money (Backend Cents -> Frontend Euros)

When you fetch data from your API, use the `format` function to display it.

**Example:** In a component showing a product's price.

```vue
<template>
  <div>
    <h1>Product Details</h1>
    <p>Price: {{ format(product.priceInCents) }}</p>
  </div>
</template>

<script setup>
// useMoney is auto-imported by Nuxt
const { format } = useMoney()

// Example product data fetched from your API
const product = ref({
  name: 'Scouting Scarf',
  priceInCents: 1550, // 1550 cents from backend
})

// The template will display "€15.50" or "€15,50" depending on the locale.
</script>
```

#### 2. Handling User Input (Frontend Euros -> Backend Cents)

When a user enters a price in a form, use the `parse` function to convert it to cents before sending it to your API.

**Example:** In a form for creating a new product.

```vue
<template>
  <form @submit.prevent="submitForm">
    <label for="price">Price in Euros</label>
    <!-- User can enter "19.99" or "19,99" -->
    <input type="text" v-model="priceInput" id="price" />
    <button type="submit">Save Product</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'

// useMoney is auto-imported by Nuxt
const { parse } = useMoney()

const priceInput = ref('0.00')

async function submitForm() {
  // Parse the user's input into cents
  const priceInCents = parse(priceInput.value) // e.g., "19,99" becomes 1999

  console.log(`Sending ${priceInCents} cents to the backend.`)

  // Send the integer `priceInCents` to your backend API
  await $fetch('/api/admin/products', {
    method: 'POST',
    body: {
      price: priceInCents,
      // ... other product data
    },
  })
}
</script>
```
