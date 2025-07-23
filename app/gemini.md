# Price / Decimal Number Locations

This document lists all occurrences of `Decimal128` in the project, which are intended to be changed to `Number`.

## Files with `Decimal128` usage:

### `server/models/user.ts`
- Line 37: `type: mongoose.Types.Decimal128,`
- Line 47: `return mongoose.Types.Decimal128.fromString(value);`

### `server/models/product.ts`
- Line 7: `price: mongoose.Types.Decimal128;`
- Line 35: `type: mongoose.Types.Decimal128,`
- Line 37: `set: (value: string | number): mongoose.Types.Decimal128 => {`
- Line 43: `return mongoose.Types.Decimal128.fromString(`
- Line 47: `return mongoose.Types.Decimal128.fromString(value.toString());`
- Line 49: `get: (value: mongoose.Types.Decimal128): string =>`
