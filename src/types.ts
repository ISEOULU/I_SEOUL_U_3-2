export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  discounts: Discount[];
}

export interface Discount {
  quantity: number;
  rate: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  name: string;
  code: string;
  discountType: 'amount' | 'percentage';
  discountValue: number;
}

export interface CouponFormType {
  name: string;
  code: string;
  discountType: 'amount' | 'percentage';
  discountValue: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'error' | 'success' | 'warning';
}

export type AddNotification = (message: string, type: Notification['type']) => void;

export interface ActionResult {
  success: boolean;
  message: string;
}

export interface ProductWithUI extends Product {
  description?: string;
  isRecommended?: boolean;
}