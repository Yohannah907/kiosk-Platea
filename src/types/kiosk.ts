export type ScreenId =
  | 'welcome'
  | 'login'
  | 'menu'
  | 'cart'
  | 'loyalty-points'
  | 'success'
  | 'admin';

export type Category = 'All Items' | 'Meals' | 'Snacks' | 'Desserts' | 'Drinks';

export type PaymentMethod = 'Cash' | 'GCash' | 'PayMaya' | 'Loyalty Points';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  emoji: string;
  contain?: boolean;
  keywords: string;
  category?: Exclude<Category, 'All Items'>;
  isAvailable?: boolean;
}

export interface StudentRecord {
  studentId: string;
  name: string;
  course: string;
  initialBalance: number;
  loyaltyPoints?: number;
}

export interface LoyaltyTransaction {
  id: number;
  studentId: string;
  pointsChange: number;
  type: 'Earned' | 'Redeemed' | 'Reset';
  description: string;
  orderNumber: string | null;
  createdAt: string;
}

export interface StudentAccount extends StudentRecord {
  balance: number;
  loyaltyPoints: number;
}

export type CartMap = Record<string, number>;

export interface OrderSummary {
  orderNumber: string;
  total: number;
  paymentMethod: PaymentMethod;
  status: 'Confirmed';
  pointsEarned?: number;
  pointsRedeemed?: number;
}

export type AdminOrderStatus = 'Confirmed' | 'Preparing' | 'Ready' | 'Completed';

export interface AdminOrderRecord {
  id?: number;
  orderNumber: string;
  studentId: string;
  paymentMethod: PaymentMethod;
  total: number;
  status: AdminOrderStatus;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}
