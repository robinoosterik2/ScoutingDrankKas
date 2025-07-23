export enum LOG_ACTIONS {
  USER_CREATED = "user_created",
  USER_UPDATED = "user_updated",
  USER_DELETED = "user_deleted",
  USER_LOGIN = "user_login",
  USER_LOGOUT = "user_logout",
  USER_ROLE_CHANGED = "user_role_changed",

  PRODUCT_CREATED = "product_created",
  PRODUCT_UPDATED = "product_updated",
  PRODUCT_DELETED = "product_deleted",
  PRODUCT_STOCK_UPDATED = "product_stock_updated",
  PRODUCT_PRICE_CHANGED = "product_price_changed",

  ORDER_CREATED = "order_created",
  ORDER_UPDATED = "order_updated",
  ORDER_CANCELLED = "order_cancelled",

  RAISE_RECEIVED = "raise_received",

  STOCK_REPLENISHED = "stock_replenished",
  STOCK_DEPLETED = "stock_depleted",
  STOCK_ADJUSTED = "stock_adjusted",
  STOCK_LOWERED = "stock_lowered",

  SYSTEM_BACKUP = "system_backup",
  SYSTEM_ERROR = "system_error",
  SYSTEM_MAINTENANCE = "system_maintenance",

  UNAUTHORIZED_ACCESS = "unauthorized_access",
  PERMISSION_DENIED = "permission_denied",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",

  CATEGORY_CREATED = "category_created",
}

export enum LOG_LEVELS {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  CRITICAL = "critical",
}

export enum LOG_CATEGORIES {
  USER = "user",
  PRODUCT = "product",
  ORDER = "order",
  INVENTORY = "inventory",
  SECURITY = "security",
  SYSTEM = "system",
  PAYMENT = "payment",
  CATEGORY = "category",
}

export enum LOG_TARGET_OBJECTS {
  USER = "User",
  PRODUCT = "Product",
  ORDER = "Order",
  LOG = "Log",
  SYSTEM = "System",
  CATEGORY = "Category",
}

export enum LOG_TAGS {
  STAM_PC = "stampc",
  MOBILE = "mobile",
  PRODUCT = "product",
  ORDER = "order",
  RAISE = "raise",
  USER = "user",
  STOCK = "stock",
  SYSTEM = "system",
  SECURITY = "security",
}
