# Price/Decimal Fields in ScoutingDrankKas

This document lists all price and decimal number fields in the project that need to be changed from Decimal128 to Number.

## Fields to Change

### 1. User Model (`app/server/models/user.ts`)

**Current Implementation:**

```typescript
balance: {
  type: mongoose.Types.Decimal128,
  required: true,
  default: 0,
  set: (value: string | number): mongoose.Types.Decimal128 => {
    if (typeof value === 'string') {
      return mongoose.Types.Decimal128.fromString(parseFloat(value).toFixed(2));
    }
    return mongoose.Types.Decimal128.fromString(value.toFixed(2));
  },
  get: (value: mongoose.Types.Decimal128): string =>
    parseFloat(value.toString()).toFixed(2)
}
```

**Recommended Changes:**

```typescript
balance: {
  type: Number,
  required: true,
  default: 0,
  set: (value: string | number): number => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return parseFloat(num.toFixed(2));
  },
  get: (value: number): number => parseFloat(value.toFixed(2))
}
```

### 2. Product Model (`app/server/models/product.ts`)

**Current Implementation:**

```typescript
price: {
  type: mongoose.Types.Decimal128,
  required: true,
  set: (value: string | number): mongoose.Types.Decimal128 => {
    if (typeof value === 'string') {
      value = parseFloat(value);
    }
    return mongoose.Types.Decimal128.fromString(value.toString());
  },
  get: (value: mongoose.Types.Decimal128): string =>
    parseFloat(value.toString()).toFixed(2)
}
```

**Recommended Changes:**

```typescript
price: {
  type: Number,
  required: true,
  min: 0,
  set: (value: string | number): number => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return parseFloat(num.toFixed(2));
  },
  get: (value: number): number => parseFloat(value.toFixed(2))
}
```

## Migration Script

Create a new file: `scripts/migrations/convert-decimal-to-number.ts`

```typescript
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../../app/server/models/user";
import { Product } from "../../app/server/models/product";

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    // Migrate Users
    const users = await User.find({});
    for (const user of users) {
      if (user.balance && typeof user.balance !== "number") {
        user.balance = parseFloat(user.balance.toString());
        await user.save();
      }
    }

    // Migrate Products
    const products = await Product.find({});
    for (const product of products) {
      if (product.price && typeof product.price !== "number") {
        product.price = parseFloat(product.price.toString());
        await product.save();
      }
    }

    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
```

## Fields Already Using Number Type

- `product.stock` (number)
- `product.totalOrders` (number)
- `product.totalQuantitySold` (number)
- `order.total` (number)
- `order.count` (number)

## Migration Steps

1. **Backup your database** before running any migrations
2. Update the schema definitions as shown above
3. Create and run the migration script:
   ```bash
   npx ts-node scripts/migrations/convert-decimal-to-number.ts
   ```
4. Update any frontend code that might be expecting string-formatted decimals
5. Test all money-related functionality thoroughly

## Important Notes

- The migration script includes proper error handling and type checking
- The getters/setters now maintain 2 decimal places for consistency
- Added input validation in setters to handle both string and number inputs
- Consider adding database transactions for the migration if you need atomic updates
- Test the migration in a staging environment first with a copy of your production data
