// TODO: 쿠폰 관리 Hook
// 힌트:
// 1. 쿠폰 목록 상태 관리 (localStorage 연동 고려)
// 2. 쿠폰 추가/삭제
//
// 반환할 값:
// - coupons: 쿠폰 배열
// - addCoupon: 새 쿠폰 추가
// - removeCoupon: 쿠폰 삭제

import { useCallback, useEffect, useState } from 'react';
import { ActionResult, CartItem, Coupon } from '../../types';
import { initialCoupons } from '../constants/constants';
import { calculateCartTotal } from '../models/cart';
import { useLocalStorage } from './useLocalStorage';

export type CouponActions = ReturnType<typeof useCoupons>;

export function useCoupons() {
  const { getLocalStorageItem, setLocalStorageItem } = useLocalStorage();
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = getLocalStorageItem('coupons');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialCoupons;
      }
    }
    return initialCoupons;
  });
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    setLocalStorageItem('coupons', coupons);
  }, [coupons]);

  const addCoupon = useCallback((newCoupon: Coupon): ActionResult => {
    let hasExistingCoupon = false;

    setCoupons((prev) => {
      const existingCoupon = prev.find((c) => c.code === newCoupon.code);
      if (existingCoupon) {
        hasExistingCoupon = true;
        return prev;
      }
      return [...prev, newCoupon];
    });

    if (hasExistingCoupon) {
      return { success: false, message: '이미 존재하는 쿠폰 코드입니다.' };
    }
    return { success: true, message: '쿠폰이 추가되었습니다.' };
  }, []);

  const deleteCoupon = useCallback(
    (couponCode: string): ActionResult => {
      setCoupons((prev) => prev.filter((c) => c.code !== couponCode));
      if (selectedCoupon?.code === couponCode) {
        setSelectedCoupon(null);
      }
      return { success: true, message: '쿠폰이 삭제되었습니다.' };
    },
    [selectedCoupon],
  );

  const applyCoupon = useCallback(
    (coupon: Coupon, cart: CartItem[]): ActionResult => {
      const currentTotal = calculateCartTotal(
        cart,
        selectedCoupon,
      ).totalAfterDiscount;

      if (currentTotal < 10000 && coupon.discountType === 'percentage') {
        return {
          success: false,
          message: 'percentage 쿠폰은 10,000원 이상 구매 시 사용 가능합니다.',
        };
      }

      setSelectedCoupon(coupon);
      return { success: true, message: '쿠폰이 적용되었습니다.' };
    },
    [selectedCoupon],
  );

  const clearSelectedCoupon = useCallback(() => {
    setSelectedCoupon(null);
  }, []);

  return {
    coupons,
    addCoupon,
    deleteCoupon,
    selectedCoupon,
    applyCoupon,
    clearSelectedCoupon,
  };
}
