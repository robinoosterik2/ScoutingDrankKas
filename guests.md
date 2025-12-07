## ✍️ AI Prompt: Guest Accounts with Separate Model

### 🎯 Objective

Implement a **Guest Account** system using a dedicated **Guest Model** in the database. While guests are stored separately from users, they should be seamlessly integrated into the user interface (appearing in the same lists) and the ordering system. Guest accounts are linked to a **Primary Account (Host)**. Orders placed for a guest are charged to the **Host's balance**, but the system tracks the **Guest's total spending** separately.

---

### 1. Schema Modification (Prisma)

**File:** `app/prisma/schema.prisma`

**Instruction:** Add a `Guest` model and update `User` and `Order` models.

#### **New Guest Model**

```prisma
model Guest {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  firstName String?
  lastName  String?

  // Link to Host (Primary User)
  hostId    Int
  host      User     @relation("HostGuests", fields: [hostId], references: [id], onDelete: Cascade)

  // Financial Tracking
  totalSpent Int     @default(0) // Tracks how much this guest owes the host
  active     Boolean @default(true)

  // Relations
  orders    Order[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### **Updates to User Model**

```prisma
model User {
  // ... existing fields ...

  guests    Guest[]  @relation("HostGuests")
}
```

#### **Updates to Order Model**

```prisma
model Order {
  // ... existing fields ...

  // Optional link to Guest
  guestId   Int?
  guest     Guest?   @relation(fields: [guestId], references: [id])
}
```

**Migration Command:**

```bash
cd app && pnpm prisma migrate dev --name add_guest_model
```

---

### 2. Unified User & Guest API

To satisfy the requirement "guests are in the same list as normal users", we will create a unified API endpoint.

**Create/Modify:** `app/server/api/users/unifed_list.get.ts` (or update exisiting `all.get.ts`)

- **Action:**
  1.  Fetch all `Users`.
  2.  Fetch all `Guests` (mapped to a compatible structure).
  3.  Combine and Sort the list.
- **Response Shape:**
  ```typescript
  type UnifiedUser = {
    id: number;
    type: "user" | "guest";
    username: string;
    displayName: string; // "First Last"
    balance: number; // For Guests, their totalSpent
    hostName?: string; // For Guests
  };
  ```

---

### 3. Guest Account Management

#### 3.1 Create Guest

**Create:** `app/server/api/guests/create.post.ts`

- **Route:** `POST /api/guests/create`
- **Auth:** Host only.
- **Logic:** Create `Guest` record linked to `auth.userId`.

#### 3.2 Reset Guest Debt

**Create:** `app/server/api/guests/[id]/reset.post.ts`

- **Auth:** Host only.
- **Logic:** Set `Guest.totalSpent = 0`.

---

### 4. Ordering System Logic

**Modify:** `app/server/api/orders/create.post.ts`

**Logic Flow:**

1.  **Input:** Request includes `targetId` and `targetType` ('user' | 'guest').
2.  **If Guest:**
    - Fetch `Guest` and logical `Host`.
    - **Payer = Host**.
    - **Update Balances:**
      - Decrement `Host.balance` by total.
      - Increment `Guest.totalSpent` by total.
    - **Create Order:**
      - `userId` = Host ID (Technical owner/payer).
      - `guestId` = Guest ID (The actual consumer).
3.  **If User:** Standard flow.

---

### 5. Frontend Updates

#### **Admin/User Lists**

- Update `app/pages/admin/users/index.vue` to consume the Unified List.
- Display Guests with a distinct badge ("Guest").
- Columns:
  - **Name:** Guest Name (Host Name in small text)
  - **Role:** "Guest"
  - **Balance:** Display `totalSpent` (Red/Indebted color).

#### **Order Page (`app/pages/orders/index.vue`)**

- List component should invoke the Unified API.
- Bartender searches for "John" -> Results show "John (User)" and "John's Friend (Guest)".
- Selecting a Guest automatically routes payment logic to the Host.

---

### 6. Summary Checklist

- [ ] Update `schema.prisma` with `Guest` model.
- [ ] Run Migration.
- [ ] Create `api/guests/create.post.ts`.
- [ ] Update `api/users/all.get.ts` (or create new) to return merged Users + Guests.
- [ ] Update `api/orders/create.post.ts` to handle `guestId`.
- [ ] Update Frontend User List to display unified data.
