import React, { useState } from 'react';
import {
  ClipboardList,
  ExternalLink,
  FileCheck2,
  Award,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { CATEGORIES, formatCurrency, getItemCategories } from '../data/menuData';
import { isApiConfigured } from '../services/api';
import {
  AdminOrderRecord,
  AdminOrderStatus,
  Category,
  LoyaltyTransaction,
  MenuItem,
  StudentAccount,
} from '../types/kiosk';
import { TestReportViewer } from './TestReportViewer';

type AdminTab = 'orders' | 'menu' | 'rewards' | 'testing';

interface AdminDashboardProps {
  menuItems: Record<string, MenuItem>;
  orders: AdminOrderRecord[];
  ordersError: string;
  isLoadingOrders: boolean;
  onRefreshOrders: () => void;
  onAddMenuItem: (item: MenuItem) => void;
  onUpdateMenuItem: (id: string, patch: Partial<MenuItem>) => void;
  onDeleteMenuItem: (id: string) => void;
  onUpdateOrderStatus: (orderNumber: string, status: AdminOrderStatus) => void;
  students: StudentAccount[];
  loyaltyTransactions: LoyaltyTransaction[];
  rewardsError: string;
  onResetSemesterPoints: () => void;
  onReturnToKiosk: () => void;
}

const ORDER_STATUSES: AdminOrderStatus[] = [
  'Confirmed',
  'Preparing',
  'Ready',
  'Completed',
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  menuItems,
  orders,
  ordersError,
  isLoadingOrders,
  onRefreshOrders,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onUpdateOrderStatus,
  students,
  loyaltyTransactions,
  rewardsError,
  onResetSemesterPoints,
  onReturnToKiosk,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [menuSearch, setMenuSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category>('All Items');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('99');
  const [newCategory, setNewCategory] =
    useState<Exclude<Category, 'All Items'>>('Meals');
  const [newKeywords, setNewKeywords] = useState('');

  const itemList = Object.values(menuItems);
  const filteredItems = itemList.filter((item) => {
    const cats = item.category ? [item.category] : getItemCategories(item.id);
    const matchesCat =
      categoryFilter === 'All Items' || cats.includes(categoryFilter);
    const q = menuSearch.trim().toLowerCase();
    const matchesQ =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q) ||
      cats.some((category) => category.toLowerCase().includes(q));
    return matchesCat && matchesQ;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const availableCount = itemList.filter((i) => i.isAvailable !== false).length;

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    const price = Number(newPrice);
    if (!name || Number.isNaN(price) || price <= 0) return;

    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    onAddMenuItem({
      id,
      name,
      price,
      image: '',
      emoji: '🍽️',
      keywords: newKeywords.trim() || name.toLowerCase(),
      category: newCategory,
      isAvailable: true,
    });
    setNewName('');
    setNewPrice('99');
    setNewKeywords('');
    setShowAddForm(false);
  };

  return (
    <div
      data-testid="admin-dashboard"
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans"
    >
      {/* Left Sidebar */}
      <aside className="w-full md:w-[250px] bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="font-platea-logo text-3xl text-[#0b5a14] leading-none">
              Platea
            </span>
            <p className="text-xs text-slate-500 mt-1">Kiosk Admin Console</p>
          </div>
        </div>

        <nav className="p-3 space-y-1 flex-1" aria-label="Admin Navigation">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#effff1] text-[#04502a]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span>Live Orders</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-[#effff1] text-[#04502a]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 shrink-0" />
            <span>Menu Management</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rewards')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'rewards'
                ? 'bg-[#effff1] text-[#04502a]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Loyalty Rewards</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('testing')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'testing'
                ? 'bg-[#effff1] text-[#04502a]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4 shrink-0" />
            <span>Selenium &amp; Reports</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2">
          <p className="text-xs text-slate-500">
            Backend:{' '}
            <span className="font-medium text-slate-700">
              {isApiConfigured() ? '.NET 8 Web API' : 'Local Session State'}
            </span>
          </p>
          <button
            type="button"
            onClick={onReturnToKiosk}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#04502a] hover:bg-[#0b6b38] text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Kiosk View</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            Platea Admin <span className="mx-1.5">/</span>
            <span className="font-medium text-slate-900">
              {activeTab === 'orders'
                ? 'Live Orders'
                : activeTab === 'menu'
                  ? 'Menu Management'
                  : activeTab === 'rewards'
                    ? 'Loyalty Rewards'
                  : 'Selenium & Reports'}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-600 tabular-nums">
            <span>
              Orders: <strong className="text-slate-900">{orders.length}</strong>
            </span>
            <span>
              Active Items:{' '}
              <strong className="text-slate-900">{availableCount}</strong>
            </span>
            <span>
              Sales:{' '}
              <strong className="text-slate-900">
                {formatCurrency(totalRevenue)}
              </strong>
            </span>
          </div>
        </header>

        <main className="p-6 max-w-[1200px] w-full mx-auto">
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Kiosk Order Queue
                  </h1>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Orders submitted from the Platea Kiosk appear here for kitchen preparation.
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="refresh-orders-btn"
                  onClick={onRefreshOrders}
                  disabled={isLoadingOrders}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoadingOrders ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </button>
              </div>

              {ordersError && (
                <div
                  role="alert"
                  data-testid="orders-error"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                  Could not sync kiosk orders: {ordersError}
                </div>
              )}

              {orders.length > 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                        <th className="py-2.5 px-4">Order #</th>
                        <th className="py-2.5 px-4">Student ID</th>
                        <th className="py-2.5 px-4">Items</th>
                        <th className="py-2.5 px-4">Payment</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                        <th className="py-2.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {orders.map((order) => (
                        <tr
                          key={order.orderNumber}
                          data-testid={`admin-order-${order.orderNumber.replace('#', '')}`}
                          className="hover:bg-slate-50"
                        >
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                            {order.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                            {order.studentId || 'Guest'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {order.items
                              .map((i) => `${i.quantity}x ${i.name}`)
                              .join(', ')}
                          </td>
                          <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                            {order.paymentMethod}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-900 tabular-nums whitespace-nowrap">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <select
                              value={order.status}
                              data-testid={`order-status-${order.orderNumber.replace('#', '')}`}
                              aria-label={`Status for ${order.orderNumber}`}
                              onChange={(e) =>
                                onUpdateOrderStatus(
                                  order.orderNumber,
                                  e.target.value as AdminOrderStatus,
                                )
                              }
                              className="text-xs font-medium border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-800 cursor-pointer"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : isLoadingOrders ? (
                <div
                  data-testid="orders-loading"
                  className="bg-white border border-slate-200 rounded-lg p-10 text-center text-sm text-slate-600"
                >
                  Loading kiosk orders…
                </div>
              ) : ordersError ? (
                <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
                  <p className="text-base font-medium text-slate-800">
                    Orders are temporarily unavailable
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Refresh to retry syncing the order queue.
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
                  <p className="text-base font-medium text-slate-800">
                    No kiosk orders yet
                  </p>
                  <p className="text-sm text-slate-500 mt-1 mb-5">
                    Place an order in the Platea Kiosk to see live kitchen orders and status controls here.
                  </p>
                  <button
                    type="button"
                    onClick={onReturnToKiosk}
                    className="px-4 py-2 rounded-lg bg-[#04502a] hover:bg-[#0b6b38] text-white text-sm font-medium cursor-pointer"
                  >
                    Go to Kiosk
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Menu Catalog Management
                  </h1>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Changes made here sync directly to the Platea Kiosk menu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddForm((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#04502a] hover:bg-[#0b6b38] text-white text-sm font-medium cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Menu Item</span>
                </button>
              </div>

              {showAddForm && (
                <form
                  onSubmit={handleCreateItem}
                  className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Chicken Adobo"
                      className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Price (₱)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) =>
                        setNewCategory(
                          e.target.value as Exclude<Category, 'All Items'>,
                        )
                      }
                      className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm bg-white"
                    >
                      <option value="Meals">Meals</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Drinks">Drinks</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 h-9 px-4 rounded-md bg-[#04502a] text-white text-sm font-medium hover:bg-[#0b6b38] cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="h-9 px-3 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5 bg-slate-200/70 p-1 rounded-lg">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        categoryFilter === cat
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Filter items..."
                    className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 px-4">Item</th>
                      <th className="py-2.5 px-4">Categories</th>
                      <th className="py-2.5 px-4">Price (₱)</th>
                      <th className="py-2.5 px-4">Availability</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredItems.map((item) => {
                      const cats = item.category
                        ? [item.category]
                        : getItemCategories(item.id);
                      const isAvailable = item.isAvailable !== false;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-medium text-slate-900">
                            {item.name}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 text-xs">
                            {cats.join(' · ') || 'General'}
                          </td>
                          <td className="py-2.5 px-4">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              aria-label={`Price for ${item.name}`}
                              value={item.price}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (!Number.isNaN(val) && val > 0) {
                                  onUpdateMenuItem(item.id, { price: val });
                                }
                              }}
                              className="w-24 h-8 px-2 border border-slate-300 rounded text-sm tabular-nums"
                            />
                          </td>
                          <td className="py-2.5 px-4">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateMenuItem(item.id, {
                                  isAvailable: !isAvailable,
                                })
                              }
                              className={`text-xs font-semibold px-2.5 py-1 rounded border cursor-pointer ${
                                isAvailable
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : 'bg-amber-50 border-amber-200 text-amber-700'
                              }`}
                            >
                              {isAvailable ? 'Available' : 'Hidden'}
                            </button>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => onDeleteMenuItem(item.id)}
                              aria-label={`Delete ${item.name}`}
                              className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <section className="space-y-5" data-testid="admin-loyalty-panel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Platea Loyalty Rewards
                  </h1>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Review student points and audit every earning, redemption, and reset.
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="reset-semester-points-btn"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Reset loyalty points for all students at the start of a new semester?',
                      )
                    ) {
                      onResetSemesterPoints();
                    }
                  }}
                  disabled={students.length === 0}
                  className="px-4 py-2 rounded-lg bg-[#04502a] hover:bg-[#0b6b38] disabled:opacity-50 text-white text-sm font-medium cursor-pointer disabled:cursor-not-allowed"
                >
                  Reset Semester Points
                </button>
              </div>

              {rewardsError && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {rewardsError}
                </p>
              )}

              <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 px-4">Student ID</th>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Course</th>
                      <th className="py-2.5 px-4 text-right">Loyalty Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {students.map((student) => (
                      <tr key={student.studentId}>
                        <td className="py-2.5 px-4 font-medium">{student.studentId}</td>
                        <td className="py-2.5 px-4">{student.name}</td>
                        <td className="py-2.5 px-4 text-slate-600">{student.course}</td>
                        <td className="py-2.5 px-4 text-right font-semibold tabular-nums">
                          {student.loyaltyPoints}
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">
                          No student accounts are available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Student ID</th>
                      <th className="py-2.5 px-4">Activity</th>
                      <th className="py-2.5 px-4">Order</th>
                      <th className="py-2.5 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loyaltyTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4">{transaction.studentId}</td>
                        <td className="py-2.5 px-4">
                          <span className="font-medium">{transaction.type}</span>
                          <span className="block text-xs text-slate-500">
                            {transaction.description}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">{transaction.orderNumber ?? '—'}</td>
                        <td className="py-2.5 px-4 text-right font-semibold tabular-nums">
                          {transaction.pointsChange > 0 ? '+' : ''}
                          {transaction.pointsChange}
                        </td>
                      </tr>
                    ))}
                    {loyaltyTransactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No loyalty activity has been recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'testing' && (
            <TestReportViewer menuItems={menuItems} />
          )}
        </main>
      </div>
    </div>
  );
};
