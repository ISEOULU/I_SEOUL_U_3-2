import type { Product, CartItem } from '../../types';

/**
 * 순수 함수: 상품 재고에서 장바구니 수량을 뺀 남은 재고
 */
export function getRemainingStock(product: Product, cart: CartItem[]): number {
  const cartItem = cart.find((item) => item.product.id === product.id);
  return product.stock - (cartItem?.quantity ?? 0);
}
