import { useState, useCallback } from 'react';
import { ActionResult, AddNotification, Notification } from '../types';
import Toast from './components/ui/Toast';
import { getRemainingStock } from './models/cart';
import { useCart } from './hooks/useCart';
import { useSearch } from './hooks/useSearch';
import { useProducts } from './hooks/useProducts';
import { useCoupons } from './hooks/useCoupons';
import Header from './components/ui/Header';
import AdminPage from './pages/AdminPage';
import CartPage from './pages/CartPage';

const App = () => {
  const { products, updateProduct, addProduct, setProducts } = useProducts();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } =
    useCart();
  const {
    coupons,
    selectedCoupon,
    addCoupon,
    deleteCoupon,
    applyCoupon,
    clearSelectedCoupon,
  } = useCoupons();
  const { searchTerm, setSearchTerm, debouncedSearchTerm } = useSearch();

  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const formatPrice = (price: number, productId?: string): string => {
    if (productId) {
      const product = products.find((p) => p.id === productId);
      if (product && getRemainingStock(product, cart) <= 0) {
        return 'SOLD OUT';
      }
    }

    if (isAdmin) {
      return `${price.toLocaleString()}원`;
    }

    return `₩${price.toLocaleString()}`;
  };

  const addNotification: AddNotification = useCallback(
    (message, type = 'success') => {
      const id = Date.now().toString();
      setNotifications((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    },
    [],
  );

  const notify = useCallback(
    (result: ActionResult) => {
      if (result.message)
        addNotification(result.message, result.success ? 'success' : 'error');
    },
    [addNotification],
  );

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map((notif) => (
            <Toast
              key={notif.id}
              notif={notif}
              setNotifications={setNotifications}
            />
          ))}
        </div>
      )}

      <Header
        isAdmin={isAdmin}
        toggleAdmin={() => setIsAdmin(!isAdmin)}
        totalItemCount={totalItemCount}
        searchTerm={searchTerm}
        onSearchTermChange={(value) => setSearchTerm(value)}
      />

      {isAdmin ? (
        <AdminPage
          products={products}
          updateProduct={updateProduct}
          addProduct={addProduct}
          setProducts={setProducts}
          coupons={coupons}
          addCoupon={addCoupon}
          deleteCoupon={deleteCoupon}
          addNotification={addNotification}
          notify={notify}
          formatPrice={formatPrice}
        />
      ) : (
        <CartPage
          products={products}
          cart={cart}
          formatPrice={formatPrice}
          getRemainingStock={getRemainingStock}
          debouncedSearchTerm={debouncedSearchTerm}
          notify={notify}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          selectedCoupon={selectedCoupon}
          addNotification={addNotification}
          clearCart={clearCart}
          coupons={coupons}
          applyCoupon={applyCoupon}
          clearSelectedCoupon={clearSelectedCoupon}
        />
      )}
    </div>
  );
};

export default App;
