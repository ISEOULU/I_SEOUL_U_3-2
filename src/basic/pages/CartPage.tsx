import { useCallback } from 'react';
import {
  ActionResult,
  AddNotification,
  CartActions,
  CouponActions,
  ProductActions,
} from '../../types';
import { CartIcon, XIcon } from '../components/icons';
import {
  calculateCartTotal,
  calculateItemTotal,
  getRemainingStock,
} from '../models/cart';
import ProductCard from '../components/ui/product/ProductCard';

interface CartPageProps {
  products: ProductActions['products'];
  cart: CartActions['cart'];
  debouncedSearchTerm: string;
  notify: (result: ActionResult) => void;
  addToCart: CartActions['addToCart'];
  removeFromCart: CartActions['removeFromCart'];
  updateQuantity: CartActions['updateQuantity'];
  selectedCoupon: CouponActions['selectedCoupon'];
  addNotification: AddNotification;
  clearCart: CartActions['clearCart'];
  coupons: CouponActions['coupons'];
  applyCoupon: CouponActions['applyCoupon'];
  clearSelectedCoupon: CouponActions['clearSelectedCoupon'];
}

function CartPage({
  products,
  cart,
  debouncedSearchTerm,
  notify,
  addToCart,
  removeFromCart,
  updateQuantity,
  selectedCoupon,
  addNotification,
  clearCart,
  coupons,
  applyCoupon,
  clearSelectedCoupon,
}: CartPageProps) {
  const totals = calculateCartTotal(cart, selectedCoupon);

  const filteredProducts = debouncedSearchTerm
    ? products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase())),
      )
    : products;

  const completeOrder = useCallback(() => {
    const orderNumber = `ORD-${Date.now()}`;
    addNotification(
      `주문이 완료되었습니다. 주문번호: ${orderNumber}`,
      'success',
    );
    clearCart();
    clearSelectedCoupon();
  }, [addNotification, clearSelectedCoupon, clearCart]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* 상품 목록 */}
          <section>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                전체 상품
              </h2>
              <div className="text-sm text-gray-600">
                총 {products.length}개 상품
              </div>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  "{debouncedSearchTerm}"에 대한 검색 결과가 없습니다.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const remainingStock = getRemainingStock(product, cart);

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      remainingStock={remainingStock}
                      onAddToCart={(p) => notify(addToCart(p))}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <section className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CartIcon strokeWidth={2} className="w-5 h-5 mr-2" />
                장바구니
              </h2>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <CartIcon
                    strokeWidth={1}
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  />
                  <p className="text-gray-500 text-sm">
                    장바구니가 비어있습니다
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const itemTotal = calculateItemTotal(item, cart);
                    const originalPrice = item.product.price * item.quantity;
                    const hasDiscount = itemTotal < originalPrice;
                    const discountRate = hasDiscount
                      ? Math.round((1 - itemTotal / originalPrice) * 100)
                      : 0;

                    return (
                      <div
                        key={item.product.id}
                        className="border-b pb-3 last:border-b-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-medium text-gray-900 flex-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-gray-400 hover:text-red-500 ml-2"
                          >
                            <XIcon strokeWidth={2} className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <button
                              onClick={() =>
                                notify(
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1,
                                    products,
                                  ),
                                )
                              }
                              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              <span className="text-xs">−</span>
                            </button>
                            <span className="mx-3 text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                notify(
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity + 1,
                                    products,
                                  ),
                                )
                              }
                              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              <span className="text-xs">+</span>
                            </button>
                          </div>
                          <div className="text-right">
                            {hasDiscount && (
                              <span className="text-xs text-red-500 font-medium block">
                                -{discountRate}%
                              </span>
                            )}
                            <p className="text-sm font-medium text-gray-900">
                              {Math.round(itemTotal).toLocaleString()}원
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {cart.length > 0 && (
              <>
                <section className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      쿠폰 할인
                    </h3>
                    <button className="text-xs text-blue-600 hover:underline">
                      쿠폰 등록
                    </button>
                  </div>
                  {coupons.length > 0 && (
                    <select
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                      value={selectedCoupon?.code || ''}
                      onChange={(e) => {
                        const coupon = coupons.find(
                          (c) => c.code === e.target.value,
                        );
                        if (coupon) notify(applyCoupon(coupon, cart));
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
                  )}
                </section>

                <section className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold mb-4">결제 정보</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">상품 금액</span>
                      <span className="font-medium">
                        {totals.totalBeforeDiscount.toLocaleString()}원
                      </span>
                    </div>
                    {totals.totalBeforeDiscount - totals.totalAfterDiscount >
                      0 && (
                      <div className="flex justify-between text-red-500">
                        <span>할인 금액</span>
                        <span>
                          -
                          {(
                            totals.totalBeforeDiscount -
                            totals.totalAfterDiscount
                          ).toLocaleString()}
                          원
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-t border-gray-200">
                      <span className="font-semibold">결제 예정 금액</span>
                      <span className="font-bold text-lg text-gray-900">
                        {totals.totalAfterDiscount.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={completeOrder}
                    className="w-full mt-4 py-3 bg-yellow-400 text-gray-900 rounded-md font-medium hover:bg-yellow-500 transition-colors"
                  >
                    {totals.totalAfterDiscount.toLocaleString()}원 결제하기
                  </button>

                  <div className="mt-3 text-xs text-gray-500 text-center">
                    <p>* 실제 결제는 이루어지지 않습니다</p>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default CartPage;
