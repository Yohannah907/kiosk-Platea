import { getItemCategories } from './menuData';
import { CartMap, MenuItem } from '../types/kiosk';

export const LOYALTY_POINTS_PER_PESO = 10;

export function getLoyaltyPointsCost(amount: number): number {
  return Math.ceil(Math.round(amount * 100) / (100 / LOYALTY_POINTS_PER_PESO));
}

export function isHappyHour(date = new Date()): boolean {
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes >= 14 * 60 && minutes <= 16 * 60 + 30;
}

export function isHappyHourEligible(item: MenuItem): boolean {
  return (
    [item.category, ...getItemCategories(item.id)].some(
      (category) => category === 'Snacks' || category === 'Desserts',
    ) ||
    /\bcoffee\b/i.test(item.keywords) ||
    /coffee|latte|americano/i.test(item.name)
  );
}

export function calculateLoyaltyPoints(
  cart: CartMap,
  items: Record<string, MenuItem>,
  options: { happyHour: boolean; byoTumbler: boolean },
): number {
  const paidTotal = Object.entries(cart).reduce((total, [itemId, quantity]) => {
    const item = items[itemId];
    return total + (item ? item.price * quantity : 0);
  }, 0);

  if (paidTotal < 40) return 0;

  const basePoints = Math.floor(paidTotal / 20);
  const happyHourBonus = options.happyHour
    ? Math.floor(
        Object.entries(cart).reduce((total, [itemId, quantity]) => {
          const item = items[itemId];
          return total + (item && isHappyHourEligible(item) ? item.price * quantity : 0);
        }, 0) / 20,
      )
    : 0;
  const tumblerBonus = options.byoTumbler
    ? Object.entries(cart).some(
        ([itemId, quantity]) =>
          quantity > 0 &&
          Boolean(
            items[itemId] &&
              (items[itemId].category === 'Drinks' ||
                getItemCategories(itemId).includes('Drinks')),
          ),
      )
      ? 2
      : 0
    : 0;

  return basePoints + happyHourBonus + tumblerBonus;
}
