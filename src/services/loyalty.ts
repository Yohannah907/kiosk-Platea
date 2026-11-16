import { getStudentById, STUDENTS } from '../data/studentData';
import {
  calculateLoyaltyPoints,
  getLoyaltyPointsCost,
  isHappyHour,
} from '../data/loyaltyRewards';
import {
  AdminOrderRecord,
  CartMap,
  LoyaltyTransaction,
  MenuItem,
  PaymentMethod,
  StudentAccount,
  StudentRecord,
} from '../types/kiosk';

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
const ACCOUNTS_KEY = 'platea-student-accounts';
const TRANSACTIONS_KEY = 'platea-loyalty-transactions';
const ORDER_SEQUENCE_KEY = 'platea-order-sequence';
const ORDERS_KEY = 'platea-orders';

export interface CheckoutLine {
  itemSlug: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutInput {
  student: StudentRecord | null;
  paymentMethod: PaymentMethod;
  items: CheckoutLine[];
  paidCart: CartMap;
  menuItems: Record<string, MenuItem>;
  happyHour: boolean;
  byoTumbler: boolean;
}

export interface CheckoutResult {
  order: AdminOrderRecord;
  student: StudentAccount | null;
  pointsEarned: number;
  pointsRedeemed: number;
}

interface ApiOrderRecord {
  id: number;
  orderNumber: string;
  studentId: string;
  paymentMethod: PaymentMethod;
  total: number;
  status: AdminOrderRecord['status'];
  createdAt: string;
  items: Array<{
    itemSlug: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

function mapApiOrder(order: ApiOrderRecord): AdminOrderRecord {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    studentId: order.studentId,
    paymentMethod: order.paymentMethod,
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.itemSlug,
      name: item.itemName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
  };
}

function readStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  return raw === null ? fallback : (JSON.parse(raw) as T);
}

function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function localAccounts(): Record<string, StudentAccount> {
  return readStorage<Record<string, StudentAccount>>(ACCOUNTS_KEY, {});
}

function getLocalAccount(profile: StudentRecord): StudentAccount {
  const accounts = localAccounts();
  const account = accounts[profile.studentId] ?? {
    ...profile,
    balance: profile.initialBalance,
    loyaltyPoints: profile.loyaltyPoints ?? 0,
  };
  accounts[profile.studentId] = account;
  writeStorage(ACCOUNTS_KEY, accounts);
  return account;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, init);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot connect to the Platea API at ${API_BASE}. Start the web API and try again.`,
        { cause: error },
      );
    }
    throw error;
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status}).`);
  }
  return (await response.json()) as T;
}

export async function fetchOrders(): Promise<AdminOrderRecord[]> {
  if (API_BASE) {
    const orders = await request<ApiOrderRecord[]>('/api/orders');
    return orders.map(mapApiOrder);
  }
  return readStorage<AdminOrderRecord[]>(ORDERS_KEY, []).sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  );
}

export async function updateOrderStatus(
  order: AdminOrderRecord,
  status: AdminOrderRecord['status'],
): Promise<AdminOrderRecord> {
  if (API_BASE) {
    if (order.id === undefined) {
      throw new Error(`Cannot update ${order.orderNumber}: missing order ID.`);
    }
    await request<ApiOrderRecord>(`/api/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  } else {
    const orders = readStorage<AdminOrderRecord[]>(ORDERS_KEY, []);
    const index = orders.findIndex(
      (entry) => entry.orderNumber === order.orderNumber,
    );
    if (index < 0) {
      throw new Error(`Order ${order.orderNumber} was not found.`);
    }
    orders[index] = { ...orders[index], status };
    writeStorage(ORDERS_KEY, orders);
  }
  return { ...order, status };
}

export async function registerStudent(
  profile: StudentRecord,
): Promise<StudentAccount> {
  if (!API_BASE) return getLocalAccount(profile);
  const account = await request<Omit<StudentAccount, 'initialBalance'> & { name: string }>(
    '/api/students',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: profile.studentId,
        name: profile.name,
        course: profile.course,
        initialBalance: profile.initialBalance,
      }),
    },
  );
  return { ...account, initialBalance: profile.initialBalance };
}

export async function fetchStudentAccounts(): Promise<StudentAccount[]> {
  if (API_BASE) {
    const accounts = await request<
      Array<Omit<StudentAccount, 'initialBalance'> & { name: string }>
    >('/api/students');
    return accounts.map((account) => ({
      ...account,
      initialBalance:
        getStudentById(account.studentId)?.initialBalance ?? account.balance,
    }));
  }
  const accounts = localAccounts();
  return STUDENTS.map((profile) => getLocalAccount(profile)).map(
    (account) => accounts[account.studentId] ?? account,
  );
}

export async function fetchLoyaltyTransactions(
  studentId?: string,
): Promise<LoyaltyTransaction[]> {
  if (API_BASE) {
    const path = studentId
      ? `/api/students/${encodeURIComponent(studentId)}/transactions`
      : '/api/students/transactions';
    return request<LoyaltyTransaction[]>(path);
  }
  const transactions = readStorage<LoyaltyTransaction[]>(TRANSACTIONS_KEY, []);
  return studentId
    ? transactions.filter((entry) => entry.studentId === studentId)
    : transactions;
}

export async function resetSemesterPoints(): Promise<StudentAccount[]> {
  if (API_BASE) {
    const accounts = await request<
      Array<Omit<StudentAccount, 'initialBalance'> & { name: string }>
    >('/api/students/reset-semester-points', {
      method: 'POST',
    });
    return accounts.map((account) => ({
      ...account,
      initialBalance:
        getStudentById(account.studentId)?.initialBalance ?? account.balance,
    }));
  }

  const accounts = localAccounts();
  const transactions = readStorage<LoyaltyTransaction[]>(TRANSACTIONS_KEY, []);
  let nextId = Math.max(
    Date.now(),
    ...transactions.map((transaction) => transaction.id + 1),
  );
  for (const profile of STUDENTS) {
    const account = accounts[profile.studentId] ?? getLocalAccount(profile);
    if (account.loyaltyPoints <= 0) continue;
    transactions.unshift({
      id: nextId++,
      studentId: account.studentId,
      pointsChange: -account.loyaltyPoints,
      type: 'Reset',
      description: 'Semester loyalty points reset',
      orderNumber: null,
      createdAt: new Date().toISOString(),
    });
    account.loyaltyPoints = 0;
    accounts[profile.studentId] = account;
  }
  writeStorage(ACCOUNTS_KEY, accounts);
  writeStorage(TRANSACTIONS_KEY, transactions);
  return Object.values(accounts);
}

export async function placeLoyaltyOrder(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  if (API_BASE) {
    const response = await request<{
      order: {
        id: number;
        orderNumber: string;
        studentId: string;
        paymentMethod: PaymentMethod;
        total: number;
        status: 'Confirmed';
        createdAt: string;
        items: Array<{
          itemSlug: string;
          itemName: string;
          quantity: number;
          unitPrice: number;
        }>;
      };
      pointsEarned: number;
      pointsRedeemed: number;
      student: StudentAccount | null;
    }>('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: input.student?.studentId ?? 'Guest',
        studentName: input.student?.name ?? '',
        course: input.student?.course ?? '',
        initialBalance: input.student?.initialBalance ?? 0,
        paymentMethod: input.paymentMethod,
        happyHour: input.happyHour,
        byoTumbler: input.byoTumbler,
        items: input.items,
      }),
    });
    return {
      order: {
        id: response.order.id,
        orderNumber: response.order.orderNumber,
        studentId: response.order.studentId,
        paymentMethod: response.order.paymentMethod,
        total: response.order.total,
        status: response.order.status,
        createdAt: response.order.createdAt,
        items: response.order.items.map((item) => ({
          id: item.itemSlug,
          name: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
      student: response.student
        ? {
            ...response.student,
            initialBalance:
              input.student?.initialBalance ?? response.student.balance,
          }
        : null,
      pointsEarned: response.pointsEarned,
      pointsRedeemed: response.pointsRedeemed,
    };
  }

  const paidTotal = input.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const pointsRedeemed =
    input.paymentMethod === 'Loyalty Points'
      ? getLoyaltyPointsCost(paidTotal)
      : 0;

  let account = input.student ? getLocalAccount(input.student) : null;
  if (input.paymentMethod === 'Loyalty Points' && !account)
    throw new Error('Loyalty Points payment is available to registered students only.');
  if (account && account.loyaltyPoints < pointsRedeemed)
    throw new Error('The student does not have enough loyalty points to cover this order.');

  const pointsEarned =
    input.paymentMethod === 'Loyalty Points'
      ? 0
      : calculateLoyaltyPoints(input.paidCart, input.menuItems, {
          happyHour: input.happyHour && isHappyHour(),
          byoTumbler: input.byoTumbler,
        });
  const orderNumber = `#PLT-${String(
    readStorage<number>(ORDER_SEQUENCE_KEY, 0) + 1,
  ).padStart(3, '0')}`;
  writeStorage(
    ORDER_SEQUENCE_KEY,
    readStorage<number>(ORDER_SEQUENCE_KEY, 0) + 1,
  );

  const transactions = readStorage<LoyaltyTransaction[]>(TRANSACTIONS_KEY, []);
  const newTransactions: LoyaltyTransaction[] = [];
  let nextTransactionId = Math.max(
    Date.now(),
    ...transactions.map((transaction) => transaction.id + 1),
  );
  if (account && pointsRedeemed > 0) {
    account.loyaltyPoints -= pointsRedeemed;
    newTransactions.push({
      id: nextTransactionId++,
      studentId: account.studentId,
      pointsChange: -pointsRedeemed,
      type: 'Redeemed',
      description: `Paid order with loyalty points (${paidTotal.toFixed(2)} value)`,
      orderNumber,
      createdAt: new Date().toISOString(),
    });
  }
  if (account && pointsEarned > 0) {
    account.loyaltyPoints += pointsEarned;
    newTransactions.push({
      id: nextTransactionId++,
      studentId: account.studentId,
      pointsChange: pointsEarned,
      type: 'Earned',
      description: `Order payment ₱${paidTotal.toFixed(2)}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    });
  }
  if (account) {
    writeStorage(ACCOUNTS_KEY, {
      ...localAccounts(),
      [account.studentId]: account,
    });
    writeStorage(TRANSACTIONS_KEY, [...newTransactions, ...transactions]);
  }

  const order: AdminOrderRecord = {
    orderNumber,
    studentId: account?.studentId ?? 'Guest',
    paymentMethod: input.paymentMethod,
    total: paidTotal,
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
    items: input.items.map((item) => ({
      id: item.itemSlug,
      name: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };
  const orders = readStorage<AdminOrderRecord[]>(ORDERS_KEY, []);
  writeStorage(ORDERS_KEY, [order, ...orders]);

  return {
    order,
    student: account,
    pointsEarned,
    pointsRedeemed,
  };
}
