export interface IUser {
  id: string;
  email?: string | null;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  accountStatus: "ACTIVE" | "MIGRATED" | "GUEST";
  loggedInAt: string | Date;
  active: boolean;
  balance: number;
  totalOrders: number;
  popularityScore: number;
  isGuest: boolean;
  hostId?: string | null;
  roleId?: string | null;
  settingsId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ICategory {
  id: string;
  name: string;
  ageRestriction: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  ageRestriction: boolean;
  stock: number;
  packSize?: number | null;
  imageUrl: string;
  totalOrders: number;
  totalQuantitySold: number;
  recentOrders?: string | null;
  popularityScore: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  archived: boolean;
  categories?: ICategory[]; // Simplified relation
}

export interface IOrderItem {
  productId: string;
  count: number;
}

export interface IOrder {
  id: string;
  userId: string;
  bartenderId?: string | null;
  guestId?: string | null;
  total: number;
  dayOfOrder: string | Date;
  items: IOrderItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ILog {
  id: string;
  executorId?: string | null;
  action: string;
  level: string;
  category: string;
  targetType: string;
  targetId?: string | null;
  snapshot?: string | null;
  changes?: string | null;
  description: string;
  metadata?: string | null;
  retentionUntil?: string | Date | null;
  tags?: string | null;
  severity?: string | null;
  containsSensitiveData: boolean;
  archived: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ILoginCredentials {
  username: string;
  password?: string;
}
