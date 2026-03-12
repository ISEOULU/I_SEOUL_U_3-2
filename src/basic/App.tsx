import { useState, useEffect } from 'react';
import { CartItem, Coupon } from '../types';
import Header from './components/layout/Header';
import Admin from './components/admin';
import ProductList from './components/product';
import NotificationList from './components/notification';
import { initialProducts, initialCoupons } from './constants';
import type { ProductWithUI } from './constants';
import { formatPriceDisplay } from './utils/formatters';
import { useNotification } from './features/notification/useNotification';

const App = () => {
  // admin, product 둘 다 사용
  const [products, setProducts] = useState<ProductWithUI[]>(() => {
    const saved = localStorage.getItem('products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  // product, header 사용
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

  // admin, product 둘 다 사용
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

  const [isAdmin, setIsAdmin] = useState(false); // header, main 분기 사용
  const [searchTerm, setSearchTerm] = useState(''); // header, product 검색 사용

  const { notifications, setNotifications, addNotification } = useNotification();

  const [totalItemCount, setTotalItemCount] = useState(0);


  useEffect(() => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItemCount(count);
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  return (
    <div className="min-h-screen bg-gray-50">
      {notifications.length > 0 && (
        <NotificationList notifications={notifications} setNotifications={setNotifications} />
      )}

      <Header
        isAdmin={isAdmin}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setIsAdmin={setIsAdmin}
        cart={cart}
        totalItemCount={totalItemCount} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAdmin ? (
          <Admin
            products={products}
            setProducts={setProducts}
            coupons={coupons}
            setCoupons={setCoupons}
            addNotification={addNotification}
          />
        ) : (
          <ProductList
            products={products}
            searchTerm={searchTerm}
            cart={cart}
            setCart={setCart}
            coupons={coupons}
            formatPriceUser={(price) => formatPriceDisplay(price, 'user')}
            addNotification={addNotification}
          />
        )}
      </main>
    </div>
  );
};

export default App;