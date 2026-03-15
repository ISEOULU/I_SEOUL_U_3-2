import { Coupon } from '../../../../types';

interface CouponSelectboxProps {
  value: string;
  applyCouponAndNoti: (coupon: Coupon) => void;
  clearSelectedCoupon: () => void;
  coupons: Coupon[];
}

function CouponSelectbox({
  value,
  applyCouponAndNoti,
  clearSelectedCoupon,
  coupons,
}: CouponSelectboxProps) {
  return (
    <select
      className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
      value={value}
      onChange={(e) => {
        const coupon = coupons.find((c) => c.code === e.target.value);
        if (coupon) applyCouponAndNoti(coupon);
        else clearSelectedCoupon();
      }}
    >
      <option value="">쿠폰 선택</option>
      {coupons.map((coupon) => (
        <option key={coupon.code} value={coupon.code}>
          {coupon.name} (
          {coupon.discountType === 'amount'
            ? `${coupon.discountValue.toLocaleString()}원`
            : `${coupon.discountValue}%`}
          )
        </option>
      ))}
    </select>
  );
}

export default CouponSelectbox;
