import { useCallback, useState } from 'react';
import {
  ActionResult,
  AddNotification,
  CouponActions,
  CouponFormType,
  ProductActions,
  ProductWithUI,
} from '../../types';
import CouponForm from '../components/ui/coupon/CouponForm';
import { PlusIcon, TrashIcon } from '../components/icons';
import { formatWon } from '../utils/formatters';
import ProductForm from '../components/ui/product/ProductForm';

interface AdminPageProps {
  products: ProductWithUI[];
  updateProduct: ProductActions['updateProduct'];
  addProduct: ProductActions['addProduct'];
  setProducts: ProductActions['setProducts'];
  coupons: CouponActions['coupons'];
  addCoupon: CouponActions['addCoupon'];
  deleteCoupon: CouponActions['deleteCoupon'];
  addNotification: AddNotification;
  notify: (result: ActionResult) => void;
}

function AdminPage({
  products,
  updateProduct,
  addProduct,
  setProducts,
  coupons,
  addCoupon,
  deleteCoupon,
  addNotification,
  notify,
}: AdminPageProps) {
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'coupons'>(
    'products',
  );
  const [editingProduct, setEditingProduct] = useState<
    ProductWithUI | {} | null
  >(null);

  // Admin

  const [couponForm, setCouponForm] = useState<CouponFormType>({
    name: '',
    code: '',
    discountType: 'amount' as 'amount' | 'percentage',
    discountValue: 0,
  });

  const deleteProduct = useCallback(
    (productId: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      addNotification('상품이 삭제되었습니다.', 'success');
    },
    [addNotification],
  );

  const onProductChange = (id: string, productForm: any) => {
    updateProduct(id, productForm);
    addNotification('상품이 수정되었습니다.', 'success');

    setEditingProduct(null);
  };

  const onProductAdd = (productForm: any) => {
    notify(
      addProduct({
        ...productForm,
        discounts: productForm.discounts,
      }),
    );

    setEditingProduct(null);
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addCoupon(couponForm);
    notify(result);
    if (result.success) {
      setCouponForm({
        name: '',
        code: '',
        discountType: 'amount',
        discountValue: 0,
      });
      setShowCouponForm(false);
    }
  };

  const startEditProduct = (product: ProductWithUI) => {
    setEditingProduct(product);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-1">상품과 쿠폰을 관리할 수 있습니다</p>
        </div>
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              상품 관리
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'coupons'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              쿠폰 관리
            </button>
          </nav>
        </div>

        {activeTab === 'products' ? (
          <section className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">상품 목록</h2>
                <button
                  onClick={() => {
                    setEditingProduct({});
                  }}
                  className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
                >
                  새 상품 추가
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상품명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가격
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      재고
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      설명
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatWon(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stock > 10
                              ? 'bg-green-100 text-green-800'
                              : product.stock > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.stock}개
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {product.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => startEditProduct(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!!editingProduct && (
              <ProductForm
                editingProduct={editingProduct}
                onProductChange={onProductChange}
                onProductAdd={onProductAdd}
                addNotification={addNotification}
                onClose={() => setEditingProduct(null)}
              />
            )}
          </section>
        ) : (
          <section className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">쿠폰 관리</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.code}
                    className="relative bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {coupon.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 font-mono">
                          {coupon.code}
                        </p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-indigo-700">
                            {coupon.discountType === 'amount'
                              ? `${coupon.discountValue.toLocaleString()}원 할인`
                              : `${coupon.discountValue}% 할인`}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => notify(deleteCoupon(coupon.code))}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon strokeWidth={2} className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center hover:border-gray-400 transition-colors">
                  <button
                    onClick={() => setShowCouponForm(!showCouponForm)}
                    className="text-gray-400 hover:text-gray-600 flex flex-col items-center"
                  >
                    <PlusIcon strokeWidth={2} className="w-8 h-8" />
                    <p className="mt-2 text-sm font-medium">새 쿠폰 추가</p>
                  </button>
                </div>
              </div>

              {showCouponForm && (
                <CouponForm
                  couponForm={couponForm}
                  setCouponForm={setCouponForm}
                  handleCouponSubmit={handleCouponSubmit}
                  setShowCouponForm={setShowCouponForm}
                  addNotification={addNotification}
                />
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default AdminPage;
