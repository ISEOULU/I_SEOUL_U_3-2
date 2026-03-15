// TODO: 장바구니 관리 Hook
// 힌트:
// 1. 장바구니 상태 관리 (localStorage 연동)
// 2. 상품 추가/삭제/수량 변경
// 3. 쿠폰 적용
// 4. 총액 계산
// 5. 재고 확인
//
// 사용할 모델 함수:
// - cartModel.addItemToCart
// - cartModel.removeItemFromCart
// - cartModel.updateCartItemQuantity
// - cartModel.calculateCartTotal
// - cartModel.getRemainingStock
//
// 반환할 값:
// - cart: 장바구니 아이템 배열 // OK
// - selectedCoupon: 선택된 쿠폰 // TODO -> coupon?
// - addToCart: 상품 추가 함수 // OK
// - removeFromCart: 상품 제거 함수 // OK
// - updateQuantity: 수량 변경 함수 // OK
// - applyCoupon: 쿠폰 적용 함수 // TODO -> coupon?
// - calculateTotal: 총액 계산 함수 // TODO -> calculateCartTotal! (cart.ts)
// - getRemainingStock: 재고 확인 함수 // TODO -> getRemainingStock! (cart.ts)
// - clearCart: 장바구니 비우기 함수 // OK

import { useCallback, useEffect, useState } from 'react';
import { ActionResult, CartItem, ProductWithUI } from '../../types';
import {
  addItemToCart,
  getRemainingStock,
  removeItemFromCart,
  updateCartItemQuantity,
} from '../models/cart';
import { useLocalStorage } from './useLocalStorage';

export type CartActions = ReturnType<typeof useCart>;

export function useCart() {
  const { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } =
    useLocalStorage();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = getLocalStorageItem('cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (cart.length > 0) {
      setLocalStorageItem('cart', cart);
    } else {
      removeLocalStorageItem('cart');
    }
  }, [cart]);

  const addToCart = useCallback(
    (product: ProductWithUI): ActionResult => {
      const remainingStock = getRemainingStock(product, cart);
      if (remainingStock <= 0) {
        return { success: false, message: '재고가 부족합니다!' };
      }

      setCart((prevCart) => addItemToCart(prevCart, product));

      return { success: true, message: '장바구니에 담았습니다' };
    },
    [cart],
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => removeItemFromCart(prevCart, productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, newQuantity: number): ActionResult => {
      if (newQuantity <= 0) {
        removeFromCart(productId);
        return { success: true, message: '' };
      }

      const cartItem = cart.find((item) => item.product.id === productId);
      if (!cartItem) {
        return { success: false, message: '' };
      }

      const maxStock = cartItem.product.stock;
      if (newQuantity > maxStock) {
        return {
          success: false,
          message: `재고는 ${maxStock}개까지만 있습니다.`,
        };
      }

      setCart((prevCart) =>
        updateCartItemQuantity(prevCart, productId, newQuantity),
      );
      return { success: true, message: '' };
    },
    [cart, removeFromCart],
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
