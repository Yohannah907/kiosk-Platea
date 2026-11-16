import React, { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { PlateaLogo } from '../components/PlateaLogo';
import { MENU_ITEMS, PAYMENT_METHODS, formatCurrency } from '../data/menuData';
import {
  calculateLoyaltyPoints,
  getLoyaltyPointsCost,
  isHappyHour,
} from '../data/loyaltyRewards';
import {
  CartMap,
  MenuItem,
  PaymentMethod,
  StudentRecord,
} from '../types/kiosk';

interface ViewCartPageProps {
  cart: CartMap;
  paymentMethod: PaymentMethod;
  student: StudentRecord | null;
  loyaltyPoints: number;
  happyHour: boolean;
  byoTumbler: boolean;
  checkoutError: string;
  isSubmitting: boolean;
  menuItems?: Record<string, MenuItem>;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onChangeHappyHour: (enabled: boolean) => void;
  onChangeByoTumbler: (enabled: boolean) => void;
  onSelectPayment: (method: PaymentMethod) => void;
  onConfirmOrder: () => void;
  onBackToMenu: () => void;
}

export const ViewCartPage: React.FC<ViewCartPageProps> = ({
  cart,
  paymentMethod,
  student,
  loyaltyPoints,
  happyHour,
  byoTumbler,
  checkoutError,
  isSubmitting,
  menuItems = MENU_ITEMS,
  onUpdateQuantity,
  onRemoveItem,
  onChangeHappyHour,
  onChangeByoTumbler,
  onSelectPayment,
  onConfirmOrder,
  onBackToMenu,
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const entries = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({
      item: menuItems[id],
      quantity: qty,
    }))
    .filter((entry) => Boolean(entry.item));

  const subtotal = entries.reduce(
    (sum, entry) => sum + entry.item.price * entry.quantity,
    0,
  );
  const additionalFees = 0;
  const total = subtotal + additionalFees;
  const isHappyHourNow = isHappyHour();
  const hasDrinks = entries.some(
    ({ item }) =>
      item.category === 'Drinks' ||
      item.id === 'orange-drink' ||
      item.id === 'mango-shake' ||
      item.id === 'spanish-latte' ||
      item.id === 'hot-americano' ||
      item.id === 'iced-tea' ||
      item.id === 'coca-cola' ||
      item.id === 'calamansi-juice' ||
      item.id === 'white-mocha' ||
      item.id === 'matcha-latte',
  );
  const estimatedPoints = calculateLoyaltyPoints(cart, menuItems, {
    happyHour: happyHour && isHappyHourNow,
    byoTumbler,
  });
  const pointsRequired = getLoyaltyPointsCost(total);
  const canPayWithPoints = Boolean(student) && loyaltyPoints >= pointsRequired;
  const pointsEarnedOnCheckout =
    paymentMethod === 'Loyalty Points' ? 0 : estimatedPoints;

  return (
    <section
      data-testid="view-cart-page"
      aria-label="View the Cart"
      className="min-h-screen bg-white px-4 sm:px-7 lg:px-8 py-4"
    >
      <div className="max-w-[1280px] mx-auto">
        <header className="border-b border-[#4a7c52] pb-3 mb-4 flex items-center justify-between">
          <PlateaLogo
            onBack={onBackToMenu}
            backLabel="Back to Menu"
            variant="inline"
          />
          <button
            type="button"
            data-testid="cart-back-btn"
            onClick={onBackToMenu}
            className="text-[16px] text-[#0b5a14] hover:underline underline-offset-4 bg-transparent border-0 cursor-pointer"
          >
            Back to Menu
          </button>
        </header>

        <h1 className="text-[28px] sm:text-[32px] font-medium text-[#0b5a14] leading-tight">
          Review your Order
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-6 lg:gap-8 items-start mt-3">
          {/* Left Column: Cart Items */}
          <div>
            <p className="text-[18px] sm:text-[20px] text-[#0b5a14] mb-4">
              Check your items before placing your order
            </p>

            {entries.length > 0 ? (
              <div className="space-y-3 lg:max-h-[calc(100vh-190px)] lg:overflow-y-auto lg:pr-2">
                {entries.map(({ item, quantity }) => (
                  <article
                      key={item.id}
                    className="border border-[#04502a] rounded-[20px] px-4 py-3 flex flex-col sm:flex-row items-center gap-3 bg-white"
                  >
                    <div className="w-[110px] h-[92px] rounded-[10px] overflow-hidden bg-white border border-[#e6ece7] flex items-center justify-center shrink-0">
                      {!failedImages[item.id] ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [item.id]: true,
                            }))
                          }
                          className={`w-full h-full block ${
                            item.contain ? 'object-contain' : 'object-cover'
                          }`}
                        />
                      ) : (
                        <span className="text-4xl" aria-hidden="true">
                          {item.emoji}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 w-full text-center sm:text-left">
                      <h2 className="text-[22px] sm:text-[24px] text-[#0b5a14] leading-tight sm:text-center">
                        {item.name}
                      </h2>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2 text-[17px] text-[#0b5a14]">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          disabled={quantity <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="w-7 h-7 rounded-full border border-[#04502a] bg-white hover:bg-[#effff1] disabled:opacity-40 disabled:cursor-not-allowed text-[#0b5a14] flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Minus className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <span className="tabular-nums">
                          Quantity: {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-7 h-7 rounded-full border border-[#04502a] bg-white hover:bg-[#effff1] text-[#0b5a14] flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Plus className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>

                      <div className="flex items-center justify-center sm:justify-between gap-3 mt-2">
                        <p className="text-[18px] text-[#0b5a14] tabular-nums">
                          {formatCurrency(item.price * quantity)}
                        </p>
                        <button
                          type="button"
                          data-testid={`remove-cart-item-${item.id}`}
                          onClick={() => onRemoveItem(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#a62d2d] px-3 py-1 text-[14px] text-[#a62d2d] hover:bg-[#fff1f1] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-[#effff1] rounded-[24px] p-8 text-center sm:text-left">
                <p className="text-[20px] text-[#0b5a14] mb-4">
                  Your cart is currently empty.
                </p>
                <button
                  type="button"
                  onClick={onBackToMenu}
                  className="px-6 py-2 rounded-full bg-[#04502a] hover:bg-[#0b6b38] text-white text-[18px] transition-colors cursor-pointer"
                >
                  Browse the menu
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <aside
            aria-label="Order Summary"
            className="bg-[#effff1] rounded-[22px] px-5 sm:px-6 pt-4 pb-5"
          >
            <h2 className="text-[26px] font-medium text-[#0b5a14] mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-[19px] text-[#0b5a14]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span data-testid="cart-subtotal" className="tabular-nums">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Additional Fees</span>
                <span className="tabular-nums">
                  {formatCurrency(additionalFees)}
                </span>
              </div>
            </div>

            <hr className="border-0 border-t border-[#223b26] my-4" />

            <div className="flex items-center justify-between text-[#0b5a14] mb-3">
              <span className="text-[28px]">Total</span>
              <span
                data-testid="cart-total"
                className="text-[22px] tabular-nums"
              >
                {formatCurrency(total)}
              </span>
            </div>

            <section
              aria-label="Loyalty points"
              className="border-t border-[#c5e8ca] pt-4 mt-4 mb-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[18px] font-medium text-[#0b5a14]">
                  Platea Loyalty Points
                </h3>
                <span
                  data-testid="cart-loyalty-points"
                  className="text-[14px] tabular-nums"
                >
                  {loyaltyPoints} pts
                </span>
              </div>
              <p className="text-[13px] text-[#35643b] mt-1">
                Earn 1 point per ₱20 spent on orders of ₱40 or more. Use
                10 points for ₱1.00 toward the full order total.
                {student ? '' : ' Sign in with a student ID to use points.'}
              </p>

              {isHappyHourNow && (
                <label className="flex items-start gap-2 mt-3 text-[14px] text-[#0b5a14]">
                  <input
                    type="checkbox"
                    checked={happyHour}
                    disabled={paymentMethod === 'Loyalty Points'}
                    onChange={(event) => onChangeHappyHour(event.target.checked)}
                    className="mt-1 accent-[#04502a] disabled:cursor-not-allowed"
                  />
                  <span>Happy Hour: 2x points on snacks, desserts, and coffee</span>
                </label>
              )}
              {hasDrinks && (
                <label className="flex items-start gap-2 mt-2 text-[14px] text-[#0b5a14]">
                  <input
                    type="checkbox"
                    checked={byoTumbler}
                    disabled={paymentMethod === 'Loyalty Points'}
                    onChange={(event) => onChangeByoTumbler(event.target.checked)}
                    className="mt-1 accent-[#04502a] disabled:cursor-not-allowed"
                  />
                  <span>BYO tumbler: earn 2 bonus points with a drink</span>
                </label>
              )}
              <p className="text-[14px] text-[#0b5a14] mt-2">
                {paymentMethod === 'Loyalty Points' ? (
                  <>Points used: <strong>{pointsRequired} pts</strong>. This order will not earn points.</>
                ) : (
                  <>Estimated points this order: <strong>{student ? pointsEarnedOnCheckout : 0}</strong></>
                )}
              </p>
            </section>

            <label
              htmlFor="cart-payment-select"
              className="block text-[19px] text-[#0b5a14] mb-2"
            >
              Payment Method
            </label>

            <select
              id="cart-payment-select"
              data-testid="cart-payment-select"
              value={paymentMethod}
              onChange={(e) => onSelectPayment(e.target.value as PaymentMethod)}
              className="w-full h-[46px] rounded-full border border-[#c5f7c8] bg-white px-5 text-[18px] text-[#0b5a14] mb-4 cursor-pointer"
            >
              {[...PAYMENT_METHODS, 'Loyalty Points' as const].map((method) => (
                <option
                  key={method}
                  value={method}
                  disabled={method === 'Loyalty Points' && !canPayWithPoints}
                >
                  {method === 'Loyalty Points'
                    ? `Loyalty Points (${loyaltyPoints.toLocaleString()} pts · ${formatCurrency(loyaltyPoints / 10)})`
                    : method}
                </option>
              ))}
            </select>

            {paymentMethod === 'Loyalty Points' && !canPayWithPoints && (
              <p role="alert" className="text-sm text-red-700 -mt-2 mb-3">
                {student
                  ? `This order needs ${pointsRequired} points, but you have ${loyaltyPoints}.`
                  : 'Log in with a student ID to pay with Loyalty Points.'}
              </p>
            )}
            {checkoutError && (
              <p role="alert" data-testid="checkout-error" className="text-sm text-red-700 mb-3">
                {checkoutError}
              </p>
            )}
            <button
              type="button"
              data-testid="confirm-order-btn"
              disabled={
                entries.length === 0 ||
                isSubmitting ||
                (paymentMethod === 'Loyalty Points' && !canPayWithPoints)
              }
              onClick={onConfirmOrder}
              className="block w-full max-w-[340px] mx-auto h-[46px] rounded-full bg-[#04502a] hover:bg-[#0b6b38] disabled:opacity-45 disabled:cursor-not-allowed text-white text-[19px] uppercase font-medium tracking-wide transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Order'}
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
};
