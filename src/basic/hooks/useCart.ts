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

import { useCallback, useState } from "react";
import { ActionResult, CartItem, ProductWithUI } from "../../types";
import { getRemainingStock } from "../models/cart";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const addToCart = useCallback((product: ProductWithUI): ActionResult => {
    const remainingStock = getRemainingStock(product, cart);
    if (remainingStock <= 0) {
      return { success: false, message: '재고가 부족합니다!' };
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem && existingItem.quantity + 1 > product.stock) {
      return { success: false, message: `재고는 ${product.stock}개까지만 있습니다.` };
    }

    setCart(prevCart => {
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: existingItem.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });

    return { success: true, message: '장바구니에 담았습니다' };
  }, [cart]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, newQuantity: number, products: ProductWithUI[]): ActionResult => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return { success: true, message: '' };
    }

    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, message: '' };

    const maxStock = product.stock;
    if (newQuantity > maxStock) {
      return { success: false, message: `재고는 ${maxStock}개까지만 있습니다.` };
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
    return { success: true, message: '' };
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
}