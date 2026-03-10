import { useCallback, useState } from "react";
import { ActionResult, CartItem, Coupon } from "../../types";
import { initialCoupons } from "../constants/constants";
import { calculateCartTotal } from "./cart";

export function useCoupon() {
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('coupons');
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
  const [showCouponForm, setShowCouponForm] = useState(false);

  const addCoupon = useCallback((newCoupon: Coupon): ActionResult => {
    const existingCoupon = coupons.find(c => c.code === newCoupon.code);
    if (existingCoupon) {
      return { success: false, message: '이미 존재하는 쿠폰 코드입니다.' };
    }
    setCoupons(prev => [...prev, newCoupon]);
    return { success: true, message: '쿠폰이 추가되었습니다.' };
  }, [coupons]);

  const deleteCoupon = useCallback((couponCode: string): ActionResult => {
    setCoupons(prev => prev.filter(c => c.code !== couponCode));
    if (selectedCoupon?.code === couponCode) {
      setSelectedCoupon(null);
    }
    return { success: true, message: '쿠폰이 삭제되었습니다.' };
  }, [selectedCoupon]);

  const applyCoupon = useCallback((coupon: Coupon, cart: CartItem[]): ActionResult => {
    const currentTotal = calculateCartTotal(cart, selectedCoupon).totalAfterDiscount;

    if (currentTotal < 10000 && coupon.discountType === 'percentage') {
      return { success: false, message: 'percentage 쿠폰은 10,000원 이상 구매 시 사용 가능합니다.' };
    }

    setSelectedCoupon(coupon);
    return { success: true, message: '쿠폰이 적용되었습니다.' };
  }, [selectedCoupon]);

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
    showCouponForm,
    setShowCouponForm
  }
}