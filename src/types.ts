import { useCart } from './basic/hooks/useCart';
import { useCoupons } from './basic/hooks/useCoupons';
import { useProducts } from './basic/hooks/useProducts';

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

export interface Notification {
  id: string;
  message: string;
  type: 'error' | 'success' | 'warning';
}

export type AddNotification = (
  message: string,
  type: Notification['type'],
) => void;

export interface ActionResult {
  success: boolean;
  message: string;
}

export interface ProductWithUI extends Product {
  description?: string;
  isRecommended?: boolean;
}

export type ProductActions = Pick<
  ReturnType<typeof useProducts>,
  'updateProduct' | 'addProduct' | 'setProducts' | 'products'
>;
export type CouponActions = Pick<
  ReturnType<typeof useCoupons>,
  | 'coupons'
  | 'addCoupon'
  | 'deleteCoupon'
  | 'selectedCoupon'
  | 'applyCoupon'
  | 'clearSelectedCoupon'
>;
export type CartActions = Pick<
  ReturnType<typeof useCart>,
  'cart' | 'addToCart' | 'removeFromCart' | 'updateQuantity' | 'clearCart'
>;
