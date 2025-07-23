# Money Handling Audit & Refactoring Plan

This document audits the current implementation of monetary values across the frontend and backend. It outlines the necessary steps to refactor the codebase to use integer cents for all backend calculations and storage, while using a `useMoney` composable for frontend display and input handling.

**The Goal:**

1.  **Backend:** All API endpoints and database models must use **integers** to represent money in **cents**.
2.  **Frontend:** All monetary display must use a `useMoney().format()` function. All user input for money must be processed by a `useMoney().parse()` function before being sent to the API.

---

## 1. Frontend Display Audit

The following files display monetary values directly to the user, often using `toFixed(2)` or direct rendering. These need to be updated to use the `format()` function from the `useMoney` composable.

### 1.1. Order Confirmation Dialog

- **File:** `components/OrderConfirmationDialog.vue`
- **Issue:** Uses `toFixed(2)` for product subtotals and the final total.

```vue
// L27: Incorrect subtotal calculation
<p class="text-sm text-gray-500 dark:text-gray-400">
  €{{ product.price }} × {{ getProductCount(product) }} = €{{ (product.price * getProductCount(product)).toFixed(2) }}
</p>

// L53: Incorrect total display
<span class="text-gray-800 dark:text-white">€{{ totalAmount.toFixed(2) }}</span>
```

- **Required Change:** The `product.price` and `totalAmount` will be in cents. Use `format()` to display them correctly.

### 1.2. Main Order Page (index)

- **File:** `pages/index.vue`
- **Issue:** Displays product prices and order subtotals incorrectly.

```vue
// L36: Incorrect order item subtotal
<span>€{{ (item.product.price * item.count).toFixed(2) }}</span>

// L121: Incorrect product price display
<p class="text-xl text-gray-500 dark:text-gray-400">
  €{{ product.price }}
</p>
```

- **Required Change:** `product.price` will be in cents. Use `format()` for display. Calculations should be done with cents and then formatted.

### 1.3. User Profile Page

- **File:** `pages/user/profile.vue`
- **Issue:** Displays user balance and raise amounts directly.

```vue
// L20: Incorrect balance display
<span
  :class="balance >= 0 ? 'text-green-600' : 'text-red-600'"
>€{{ balance }}</span>

// L137: Incorrect raise amount display amount: `€${raise.amount.toFixed(2)}`,
```

- **Required Change:** `balance` and `raise.amount` will be in cents. Use `format()` for display.

### 1.4. Admin Users List

- **File:** `pages/admin/users/index.vue`
- **Issue:** Displays user balance directly.

```vue
// L130: Incorrect balance display €{{ user.balance }}
```

- **Required Change:** `user.balance` will be in cents. Use `format()` for display.

### 1.5. Admin Products List

- **File:** `pages/admin/products/index.vue`
- **Issue:** Displays product price directly.

```vue
// L107: Incorrect price display €{{ product.price }}
```

- **Required Change:** `product.price` will be in cents. Use `format()` for display.

### 1.6. Raise Popup Component

- **File:** `components/RaisePopUp.vue`
- **Issue:** Displays recent raise amounts directly.

```vue
// L64: Incorrect amount display {{ raise.amount }}
```

- **Required Change:** `raise.amount` will be in cents. Use `format()` for display.

---

## 2. Frontend Input & API Call Audit

The following files contain forms and API calls that send monetary values to the backend. These need to be updated to parse user input into cents using `useMoney().parse()`.

### 2.1. Create/Edit Product Forms

- **Files:**
  - `pages/admin/products/create.vue`
  - `pages/admin/products/edit/[id].vue`
- **Issue:** The `v-model="formData.price"` is bound to a text/number input. The value is sent directly to the API as a float.

```html
// create.vue L40 & edit/[id].vue L26
<input
  id="productPrice"
  v-model="formData.price"
  type="text"
  <!--
  Should
  be
  text
  to
  allow
  comma
  or
  dot
  --
/>
... >
```

- **Required Change:**
  1.  Bind the input to a temporary string variable (e.g., `priceInput`).
  2.  On form submission, use `parse(priceInput)` to convert the value to cents.
  3.  Send the resulting integer to the API.

### 2.2. Raise Balance Popup

- **File:** `components/RaisePopUp.vue`
- **Issue:** The `v-model="raiseAmount"` is bound to a number input and sent directly to the API.

```vue
// L44 v-model="raiseAmount" // L167 body: { userId: this.userId, amount:
this.raiseAmount, // Sending float directly },
```

- **Required Change:**
  1.  On confirmation, use `parse(this.raiseAmount)` to convert the input to cents.
  2.  Send the integer to the `/api/admin/raises/create` endpoint.

---

## 3. Backend API Endpoint Audit

The following API endpoints currently accept or handle monetary values as floating-point numbers. They must be updated to work exclusively with integers representing cents.

### 3.1. Create Order

- **File:** `server/api/orders/create.post.ts`
- **Issue:** The endpoint performs floating-point multiplication to calculate the total.

```typescript
// L54: Incorrectly calculates price in cents from a float
const priceInCents = Math.round(productData.price * 100);

// L55: Potentially unsafe calculation
totalInCents += priceInCents * product.count;
```

- **Required Change:**
  1.  Assume `productData.price` is already stored as an integer in cents.
  2.  The calculation becomes a simple, safe integer multiplication: `totalInCents += productData.price * product.count`.
  3.  The `total` saved to the order should also be in cents.

### 3.2. Update Product

- **File:** `server/api/admin/products/update.post.ts`
- **Issue:** The endpoint expects `price` to be a float and has complex validation for it.

```typescript
// L22-L43: Complex and fragile float validation
if (
  body.price.toString().includes(",") ||
  body.price.toString().includes(".")
) { ... }
```

- **Required Change:**
  1.  The endpoint should expect `price` to be an **integer** (cents) from the frontend.
  2.  Remove all the float/string parsing logic.
  3.  Validation simplifies to checking if `price` is a non-negative integer: `if (!Number.isInteger(price) || price < 0) { ... }`.

### 3.3. Create Raise

- **File:** `server/api/admin/raises/create.post.ts`
- **Issue:** Expects `amount` to be a float from the frontend.

```typescript
// L27: Checks for a non-zero float
if (!body.amount || body.amount <= 0) {
  ...
}

// L61: Passes the float to the user model method
const updatedUser = await user.raise(amount);
```

- **Required Change:**
  1.  The endpoint should expect `amount` to be an **integer** (cents).
  2.  Validation becomes: `if (!Number.isInteger(amount) || amount <= 0) { ... }`.
  3.  The `user.raise()` method will now operate on cents.
