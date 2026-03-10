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
import { AddNotification, CartItem, ProductWithUI } from "../../types";
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

  const addToCart = useCallback((product: ProductWithUI, addNotification: AddNotification) => {
    const remainingStock = getRemainingStock(product, cart);
    if (remainingStock <= 0) {
      addNotification('재고가 부족합니다!', 'error');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        
        if (newQuantity > product.stock) {
          addNotification(`재고는 ${product.stock}개까지만 있습니다.`, 'error');
          return prevCart;
        }

        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      
      return [...prevCart, { product, quantity: 1 }];
    });
    
    addNotification('장바구니에 담았습니다', 'success');
  }, [cart, getRemainingStock]); // addNotification 의존성 주입 제거

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, newQuantity: number, products: ProductWithUI[], addNotification: AddNotification) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const maxStock = product.stock;
    if (newQuantity > maxStock) {
      addNotification(`재고는 ${maxStock}개까지만 있습니다.`, 'error');
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, [removeFromCart, getRemainingStock]); // products, addNotification 의존성 주입 제거

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