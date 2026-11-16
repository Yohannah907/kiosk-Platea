import { useEffect, useState } from 'react';
import { AdminDashboard } from './admin/AdminDashboard';
import { INITIAL_BALANCE, MENU_ITEMS } from './data/menuData';
import { AddToCartModal } from './modules/AddToCartModal';
import { BalanceRewardsPage } from './modules/BalanceRewardsPage';
import { LoginPage } from './modules/LoginPage';
import { MenuPage } from './modules/MenuPage';
import { OrderSuccessPage } from './modules/OrderSuccessPage';
import { ViewCartPage } from './modules/ViewCartPage';
import { WelcomePage } from './modules/WelcomePage';
import { syncOrderToWebApi } from './services/api';
import {
  AdminOrderRecord,
  AdminOrderStatus,
  CartMap,
  MenuItem,
  OrderSummary,
  PaymentMethod,
  ScreenId,
} from './types/kiosk';

export default function App() {
  const [screen, setScreen] = useState<ScreenId>(() =>
    window.location.hash === '#admin' ? 'admin' : 'welcome',
  );
  const [studentId, setStudentId] = useState('');
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>(MENU_ITEMS);
  const [cart, setCart] = useState<CartMap>({});
  const [lastAddedItem, setLastAddedItem] = useState<MenuItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
  const [orderSequence, setOrderSequence] = useState<number>(0);
  const [lastOrder, setLastOrder] = useState<OrderSummary | null>(null);
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#admin') {
        setScreen('admin');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateTo = (nextScreen: ScreenId) => {
    setLastAddedItem(null);
    setScreen(nextScreen);
    if (nextScreen === 'admin') {
      window.history.replaceState(null, '', '#admin');
    } else if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] ?? 0) + 1,
    }));
    setLastAddedItem(item);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const nextQty = (prev[itemId] ?? 0) + delta;
      if (nextQty <= 0) {
        const { [itemId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: nextQty };
    });
  };

  const handleConfirmOrder = () => {
    const lineItems = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = menuItems[id];
        return item
          ? {
              id: item.id,
              name: item.name,
              quantity: qty,
              unitPrice: item.price,
            }
          : null;
      })
      .filter(
        (
          entry,
        ): entry is {
          id: string;
          name: string;
          quantity: number;
          unitPrice: number;
        } => Boolean(entry),
      );

    const orderTotal = lineItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    if (orderTotal <= 0) return;

    const nextSeq = orderSequence + 1;
    const orderNumber = `#PLT-${String(nextSeq).padStart(3, '0')}`;
    setOrderSequence(nextSeq);
    setLastOrder({
      orderNumber,
      total: orderTotal,
      paymentMethod,
      status: 'Confirmed',
    });

    const newRecord: AdminOrderRecord = {
      orderNumber,
      studentId: studentId || 'Guest',
      paymentMethod,
      total: orderTotal,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      items: lineItems,
    };
    setOrders((prev) => [newRecord, ...prev]);

    void syncOrderToWebApi({
      studentId: studentId || 'Guest',
      paymentMethod,
      items: lineItems.map((i) => ({
        itemSlug: i.id,
        itemName: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    });

    if (paymentMethod !== 'Cash') {
      setBalance((prev) => Math.max(0, prev - orderTotal));
    }

    setCart({});
    navigateTo('success');
  };

  const handleBackToMenuFromSuccess = () => {
    setCart({});
    navigateTo('menu');
  };

  const handleAddAdminMenuItem = (newItem: MenuItem) => {
    setMenuItems((prev) => ({ ...prev, [newItem.id]: newItem }));
  };

  const handleUpdateAdminMenuItem = (id: string, patch: Partial<MenuItem>) => {
    setMenuItems((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      return { ...prev, [id]: { ...existing, ...patch } };
    });
  };

  const handleDeleteAdminMenuItem = (id: string) => {
    setMenuItems((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleUpdateOrderStatus = (
    orderNumber: string,
    status: AdminOrderStatus,
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.orderNumber === orderNumber ? { ...order, status } : order,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#0b5a14]">
      {screen === 'welcome' && (
        <WelcomePage
          onStartOrder={() => navigateTo('login')}
          onOpenAdmin={() => navigateTo('admin')}
        />
      )}

      {screen === 'login' && (
        <LoginPage
          initialStudentId={studentId}
          onBack={() => navigateTo('welcome')}
          onContinue={(enteredId) => {
            setStudentId(enteredId);
            navigateTo('menu');
          }}
        />
      )}

      {screen === 'menu' && (
        <>
          <MenuPage
            studentId={studentId}
            cartCount={cartCount}
            menuItems={menuItems}
            onAddToCart={handleAddToCart}
            onOpenCart={() => navigateTo('cart')}
            onOpenBalance={() => navigateTo('balance')}
            onBackToWelcome={() => navigateTo('welcome')}
          />
          <AddToCartModal
            item={lastAddedItem}
            onContinueShopping={() => setLastAddedItem(null)}
            onViewCart={() => navigateTo('cart')}
          />
        </>
      )}

      {screen === 'cart' && (
        <ViewCartPage
          cart={cart}
          paymentMethod={paymentMethod}
          menuItems={menuItems}
          onUpdateQuantity={handleUpdateQuantity}
          onSelectPayment={setPaymentMethod}
          onConfirmOrder={handleConfirmOrder}
          onBackToMenu={() => navigateTo('menu')}
        />
      )}

      {screen === 'balance' && (
        <BalanceRewardsPage
          balance={balance}
          selectedPayment={paymentMethod}
          onSelectPayment={setPaymentMethod}
          onBackToMenu={() => navigateTo('menu')}
        />
      )}

      {screen === 'success' && (
        <OrderSuccessPage
          order={lastOrder}
          onBackToMenu={handleBackToMenuFromSuccess}
        />
      )}

      {screen === 'admin' && (
        <AdminDashboard
          menuItems={menuItems}
          orders={orders}
          onAddMenuItem={handleAddAdminMenuItem}
          onUpdateMenuItem={handleUpdateAdminMenuItem}
          onDeleteMenuItem={handleDeleteAdminMenuItem}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onReturnToKiosk={() => navigateTo('welcome')}
        />
      )}
    </div>
  );
}
