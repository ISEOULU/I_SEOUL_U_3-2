import { useCallback, useEffect, useState } from "react";
import { CartItem, Coupon } from "../../types";
import { initialCoupons } from "../constants";
import { calculateCartTotal } from "../models/carts";

export const useCoupon = (addNotification: (message: string, type: "error" | "success" | "warning") => void) => {
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem("coupons");
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
    localStorage.setItem('coupons', JSON.stringify(coupons));
  }, [coupons]);

  const applyCoupon = useCallback((cart: CartItem[], coupon: Coupon) => {
      const currentTotal = calculateCartTotal(cart, selectedCoupon).totalAfterDiscount;
      
      if (currentTotal < 10000 && coupon.discountType === 'percentage') {
        addNotification('percentage 쿠폰은 10,000원 이상 구매 시 사용 가능합니다.', 'error');
        return;
      }
  
      setSelectedCoupon(coupon);
      addNotification('쿠폰이 적용되었습니다.', 'success');
    }, [addNotification, calculateCartTotal]);

  return {
    coupons,
    setCoupons,
    selectedCoupon,
    setSelectedCoupon,
    applyCoupon,
  }
};
