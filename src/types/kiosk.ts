export type ScreenId =
  | 'welcome'
  | 'login'
  | 'menu'
  | 'cart'
  | 'balance'
  | 'success'
  | 'admin';

export type Category = 'All Items' | 'Meals' | 'Snacks' | 'Desserts' | 'Drinks';

export type PaymentMethod = 'Cash' | 'GCash' | 'PayMaya';

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

export type CartMap = Record<string, number>;

export interface OrderSummary {
  orderNumber: string;
  total: number;
  paymentMethod: PaymentMethod;
  status: 'Confirmed';
}

export type AdminOrderStatus = 'Confirmed' | 'Preparing' | 'Ready' | 'Completed';

export interface AdminOrderRecord {
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
