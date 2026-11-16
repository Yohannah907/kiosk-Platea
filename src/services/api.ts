import { AdminOrderRecord, MenuItem, PaymentMethod } from '../types/kiosk';

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

export function isApiConfigured(): boolean {
  return Boolean(API_BASE);
}

export async function syncOrderToWebApi(payload: {
  studentId: string;
  paymentMethod: PaymentMethod;
  items: Array<{
    itemSlug: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
  }>;
}): Promise<AdminOrderRecord | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      orderNumber: data.orderNumber,
      studentId: data.studentId,
      paymentMethod: data.paymentMethod,
      total: Number(data.total),
      status: data.status,
      createdAt: data.createdAt,
      items: payload.items.map((i) => ({
        id: i.itemSlug,
        name: i.itemName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    };
  } catch {
    return null;
  }
}

export async function fetchMenuFromWebApi(): Promise<MenuItem[] | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/api/menu`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
