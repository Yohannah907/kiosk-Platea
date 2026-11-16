import { useEffect, useState } from 'react';
import { AdminDashboard } from './admin/AdminDashboard';
import { MENU_ITEMS } from './data/menuData';
import { getStudentById } from './data/studentData';
import { AddToCartModal } from './modules/AddToCartModal';
import { LoyaltyPointsPage } from './modules/LoyaltyPointsPage';
import { LoginPage } from './modules/LoginPage';
import { MenuPage } from './modules/MenuPage';
import { OrderSuccessPage } from './modules/OrderSuccessPage';
import { ViewCartPage } from './modules/ViewCartPage';
import { WelcomePage } from './modules/WelcomePage';
import {
  fetchLoyaltyTransactions,
  fetchOrders,
  fetchStudentAccounts,
  placeLoyaltyOrder,
  registerStudent,
  resetSemesterPoints,
  updateOrderStatus,
} from './services/loyalty';
import {
  AdminOrderRecord,
  AdminOrderStatus,
  CartMap,
  LoyaltyTransaction,
  MenuItem,
  OrderSummary,
  PaymentMethod,
  ScreenId,
  StudentAccount,
} from './types/kiosk';

export default function App() {
  const [screen, setScreen] = useState<ScreenId>(() =>
    window.location.hash === '#admin' ? 'admin' : 'welcome',
  );
  const [studentId, setStudentId] = useState('');
  const [studentAccount, setStudentAccount] = useState<StudentAccount | null>(null);
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>(MENU_ITEMS);
  const [cart, setCart] = useState<CartMap>({});
  const [happyHour, setHappyHour] = useState(false);
  const [byoTumbler, setByoTumbler] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<MenuItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([]);
  const [adminStudents, setAdminStudents] = useState<StudentAccount[]>([]);
  const [adminTransactions, setAdminTransactions] = useState<LoyaltyTransaction[]>([]);
  const [adminRewardsError, setAdminRewardsError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
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

  useEffect(() => {
    if (screen !== 'admin') return;
    Promise.all([fetchStudentAccounts(), fetchLoyaltyTransactions()])
      .then(([students, transactions]) => {
        setAdminStudents(students);
        setAdminTransactions(transactions);
        setAdminRewardsError('');
      })
      .catch((error: unknown) => {
        setAdminRewardsError(
          error instanceof Error ? error.message : 'Unable to load loyalty records.',
        );
      });
  }, [screen]);

  useEffect(() => {
    if (screen !== 'admin') return;
    let active = true;
    let requestInProgress = false;

    const loadOrders = async (initialLoad = false) => {
      if (requestInProgress) return;
      requestInProgress = true;
      if (initialLoad) setIsLoadingOrders(true);
      try {
        const latestOrders = await fetchOrders();
        if (active) {
          setOrders(latestOrders);
          setOrdersError('');
        }
      } catch (error) {
        if (active) {
          setOrdersError(
            error instanceof Error ? error.message : 'Unable to load kiosk orders.',
          );
        }
      } finally {
        requestInProgress = false;
        if (active && initialLoad) setIsLoadingOrders(false);
      }
    };

    void loadOrders(true);
    const refreshTimer = window.setInterval(() => void loadOrders(), 5000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, [screen]);

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
  const currentStudent = getStudentById(studentId) ?? null;

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] ?? 0) + 1,
    }));
    setLastAddedItem(item);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      if (prev[itemId] === undefined) return prev;
      const nextQty = Math.max(1, prev[itemId] + delta);
      return { ...prev, [itemId]: nextQty };
    });
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart((prev) => {
      const { [itemId]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleConfirmOrder = async () => {
    setCheckoutError('');
    setIsSubmittingOrder(true);
    try {
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
      if (lineItems.length === 0) return;

      const profile = getStudentById(studentId) ?? null;
      const result = await placeLoyaltyOrder({
        student: profile,
        paymentMethod,
        items: lineItems.map((item) => ({
          itemSlug: item.id,
          itemName: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paidCart: cart,
        menuItems,
        happyHour,
        byoTumbler,
      });

      const orderTotal = result.order.total;
      setLastOrder({
        orderNumber: result.order.orderNumber,
        total: orderTotal,
        paymentMethod,
        status: 'Confirmed',
        pointsEarned: result.pointsEarned,
        pointsRedeemed: result.pointsRedeemed,
      });
      setOrders((previous) => [result.order, ...previous]);
      if (result.student) {
        setStudentAccount(result.student);
        setLoyaltyTransactions(
          await fetchLoyaltyTransactions(result.student.studentId),
        );
      }
      setCart({});
      setHappyHour(false);
      setByoTumbler(false);
      setPaymentMethod('Cash');
      navigateTo('success');
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : 'Unable to complete checkout.',
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleBackToMenuFromSuccess = () => {
    setCart({});
    navigateTo('menu');
  };

  const handleResetSemesterPoints = async () => {
    setAdminRewardsError('');
    try {
      const updatedStudents = await resetSemesterPoints();
      setAdminStudents(updatedStudents);
      if (studentAccount) {
        const updatedAccount = updatedStudents.find(
          (student) => student.studentId === studentAccount.studentId,
        );
        if (updatedAccount) setStudentAccount(updatedAccount);
        setLoyaltyTransactions(
          await fetchLoyaltyTransactions(studentAccount.studentId),
        );
      }
      setAdminTransactions(await fetchLoyaltyTransactions());
    } catch (error) {
      setAdminRewardsError(
        error instanceof Error ? error.message : 'Unable to reset points.',
      );
    }
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

  const handleRefreshOrders = async () => {
    setIsLoadingOrders(true);
    try {
      setOrders(await fetchOrders());
      setOrdersError('');
    } catch (error) {
      setOrdersError(
        error instanceof Error ? error.message : 'Unable to load kiosk orders.',
      );
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (
    orderNumber: string,
    status: AdminOrderStatus,
  ) => {
    const order = orders.find((entry) => entry.orderNumber === orderNumber);
    if (!order) {
      setOrdersError(`Order ${orderNumber} is no longer in the queue. Refresh and try again.`);
      return;
    }
    try {
      const updatedOrder = await updateOrderStatus(order, status);
      setOrders((previous) =>
        previous.map((entry) =>
          entry.orderNumber === orderNumber ? updatedOrder : entry,
        ),
      );
      setOrdersError('');
    } catch (error) {
      setOrdersError(
        error instanceof Error ? error.message : 'Unable to update order status.',
      );
    }
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
          onContinue={async (enteredId) => {
            setStudentId(enteredId);
            const profile = getStudentById(enteredId);
            if (profile) {
              const account = await registerStudent(profile);
              setStudentAccount(account);
              setLoyaltyTransactions(
                await fetchLoyaltyTransactions(account.studentId),
              );
            } else {
              setStudentAccount(null);
              setLoyaltyTransactions([]);
            }
            navigateTo('menu');
          }}
        />
      )}

      {screen === 'menu' && (
        <>
          <MenuPage
            studentId={studentId}
            student={currentStudent}
            cartCount={cartCount}
            menuItems={menuItems}
            onAddToCart={handleAddToCart}
            onOpenCart={() => navigateTo('cart')}
            onOpenLoyaltyPoints={() => navigateTo('loyalty-points')}
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
          student={studentAccount}
          loyaltyPoints={studentAccount?.loyaltyPoints ?? 0}
          happyHour={happyHour}
          byoTumbler={byoTumbler}
          checkoutError={checkoutError}
          isSubmitting={isSubmittingOrder}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveCartItem}
          onChangeHappyHour={setHappyHour}
          onChangeByoTumbler={setByoTumbler}
          onSelectPayment={setPaymentMethod}
          onConfirmOrder={handleConfirmOrder}
          onBackToMenu={() => navigateTo('menu')}
        />
      )}

      {screen === 'loyalty-points' && (
        <LoyaltyPointsPage
          loyaltyPoints={studentAccount?.loyaltyPoints ?? 0}
          transactions={loyaltyTransactions}
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
          ordersError={ordersError}
          isLoadingOrders={isLoadingOrders}
          onRefreshOrders={handleRefreshOrders}
          onAddMenuItem={handleAddAdminMenuItem}
          onUpdateMenuItem={handleUpdateAdminMenuItem}
          onDeleteMenuItem={handleDeleteAdminMenuItem}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          students={adminStudents}
          loyaltyTransactions={adminTransactions}
          rewardsError={adminRewardsError}
          onResetSemesterPoints={handleResetSemesterPoints}
          onReturnToKiosk={() => navigateTo('welcome')}
        />
      )}
    </div>
  );
}
