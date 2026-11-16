import React, { useState } from 'react';
import { ArrowRight, Search, ShoppingCart, X } from 'lucide-react';
import { PlateaLogo } from '../components/PlateaLogo';
import {
  CATEGORIES,
  CATEGORY_ITEM_IDS,
  MENU_ITEMS,
  formatCurrency,
  getItemCategories,
} from '../data/menuData';
import { Category, MenuItem, StudentRecord } from '../types/kiosk';

interface MenuPageProps {
  studentId: string;
  student: StudentRecord | null;
  cartCount: number;
  menuItems?: Record<string, MenuItem>;
  onAddToCart: (item: MenuItem) => void;
  onOpenCart: () => void;
  onOpenLoyaltyPoints: () => void;
  onBackToWelcome: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  studentId,
  student,
  cartCount,
  menuItems = MENU_ITEMS,
  onAddToCart,
  onOpenCart,
  onOpenLoyaltyPoints,
  onBackToWelcome,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const matchesSearch = (item: MenuItem): boolean => {
    const categoriesText = [
      ...getItemCategories(item.id),
      ...(item.category ? [item.category] : []),
    ].join(' ');
    const haystack = `${item.name} ${item.keywords} ${categoriesText}`.toLowerCase();
    return trimmedQuery
      .split(/\s+/)
      .filter(Boolean)
      .every((word) => haystack.includes(word));
  };

  const visibleItems: MenuItem[] = trimmedQuery
    ? Object.values(menuItems).filter(
        (item) => item.isAvailable !== false && matchesSearch(item),
      )
    : (() => {
        const defaultIds = CATEGORY_ITEM_IDS[selectedCategory]
          .map((id) => menuItems[id])
          .filter((item): item is MenuItem => Boolean(item) && item.isAvailable !== false);
        const extraAdminItems = Object.values(menuItems).filter(
          (item) =>
            item.isAvailable !== false &&
            !CATEGORY_ITEM_IDS[selectedCategory].includes(item.id) &&
            (selectedCategory === 'All Items' || item.category === selectedCategory),
        );
        return [...defaultIds, ...extraAdminItems];
      })();

  const handleCategoryClick = (cat: Category) => {
    setSelectedCategory(cat);
    setSearchQuery('');
  };

  return (
    <section
      data-testid="menu-page"
      aria-label="Menu Page"
      className="min-h-screen flex flex-col bg-white"
    >
      {/* Top Navigation Header */}
      <header className="bg-white border-b border-[#e5ece6] px-4 sm:px-7 lg:px-8 py-3 lg:min-h-[84px] flex flex-wrap lg:grid lg:grid-cols-[auto_minmax(240px,1fr)_auto] items-center gap-x-7 gap-y-3">
        <PlateaLogo onLogoClick={onBackToWelcome} />

        {/* Search Field */}
        <div
          role="search"
          className="order-3 lg:order-none w-full lg:w-full lg:max-w-[480px] lg:justify-self-center h-[40px] bg-[#ece8f3] rounded-full flex items-center pl-5 pr-3 gap-2 focus-within:ring-2 focus-within:ring-[#04502a]"
        >
          <input
            type="text"
            data-testid="menu-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchQuery('');
            }}
            placeholder="Search your favorite food"
            aria-label="Search your favorite food"
            className="flex-1 bg-transparent border-0 outline-none text-[16px] text-[#333333] placeholder:text-[#555555] font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              data-testid="menu-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="p-1 text-[#555555] hover:text-[#04502a] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            aria-label="Search menu"
            className="p-1.5 text-[#555555] hover:text-[#04502a] cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Right Actions: Loyalty Points + Cart */}
        <div className="order-2 lg:order-none ml-auto lg:ml-0 flex items-center gap-3 lg:gap-4 shrink-0">
          <button
            type="button"
            data-testid="loyalty-points-btn"
            onClick={onOpenLoyaltyPoints}
            className="inline-flex items-center gap-2 text-[#0b5a14] hover:text-[#04502a] text-[17px] sm:text-[18px] cursor-pointer bg-transparent border-0 whitespace-nowrap"
          >
            <svg
              width="38"
              height="38"
              viewBox="0 0 48 48"
              aria-hidden="true"
              className="shrink-0"
            >
              <circle
                cx="24"
                cy="24"
                r="22"
                fill="#effff1"
                stroke="#4a7c52"
                strokeWidth="1.5"
              />
              <path
                d="M24 12v24M18 18h8a4 4 0 0 1 0 8h-4a4 4 0 0 0 0 8h8"
                fill="none"
                stroke="#0b5a14"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Loyalty Points</span>
          </button>

          <button
            type="button"
            data-testid="header-cart-btn"
            onClick={onOpenCart}
            aria-label={`View cart (${cartCount} items)`}
            className="relative p-1.5 text-[#12b76a] hover:text-[#04502a] transition-colors cursor-pointer bg-transparent border-0"
          >
            <ShoppingCart className="w-8 h-8 fill-[#12b76a] text-[#12b76a]" />
            {cartCount > 0 && (
              <span
                data-testid="cart-badge-count"
                className="absolute -top-1 -right-1 bg-[#04502a] text-white text-[13px] font-bold min-w-[21px] h-[21px] rounded-full flex items-center justify-center px-1 tabular-nums"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Grainy Menu Area */}
      <main className="grain-surface flex-1 px-4 sm:px-7 lg:px-8 pt-6 pb-12 relative">
        <div className="max-w-[1240px] mx-auto">
          <h1 className="text-[28px] sm:text-[32px] font-medium text-[#0b5a14] leading-tight">
            What are your cravings today?
          </h1>
          <p className="text-[17px] sm:text-[19px] text-[#0b5a14] mt-1">
            {student
              ? `Welcome, ${student.name} · ${student.course} · Student ID: ${studentId}`
              : 'Fresh choices for your campus day.'}
          </p>

          {/* 5 Category Filter Tabs */}
          <div
            role="tablist"
            aria-label="Menu Categories"
            className="flex flex-wrap gap-2.5 sm:gap-3.5 mt-6 mb-7"
          >
            {CATEGORIES.map((category) => {
              const isActive = !trimmedQuery && selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  data-testid={`category-tab-${category}`}
                  onClick={() => handleCategoryClick(category)}
                  className={`min-w-[116px] sm:min-w-[140px] h-[36px] px-4 rounded-[12px] border-[1.5px] border-[#04502a] text-[16px] sm:text-[17px] leading-none transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#04502a] text-white'
                      : 'bg-transparent text-[#0b5a14] hover:bg-white/60'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <h2 className="text-[23px] sm:text-[25px] font-medium text-[#0b5a14] mb-4">
            {trimmedQuery
              ? `Search results for “${searchQuery.trim()}” (${visibleItems.length})`
              : 'Our Menu'}
          </h2>

          {/* 3-Column Product Grid */}
          {visibleItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center gap-x-6 gap-y-8">
              {visibleItems.map((item) => (
                <article
                  key={item.id}
                  data-testid={`menu-card-${item.id}`}
                  className="w-full max-w-[292px] border border-[#7edc86] rounded-[22px] px-7 py-5 text-center bg-transparent transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 flex flex-col items-center"
                >
                  <div className="w-[236px] max-w-full h-[198px] rounded-[8px] overflow-hidden bg-white border border-[#dcdcdc] flex items-center justify-center">
                    {!failedImages[item.id] ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                        }
                        className={`w-full h-full block ${
                          item.contain ? 'object-contain' : 'object-cover'
                        }`}
                      />
                    ) : (
                      <span className="text-6xl" aria-hidden="true">
                        {item.emoji}
                      </span>
                    )}
                  </div>

                  <h3 className="text-[25px] text-[#0b5a14] leading-tight mt-2">
                    {item.name}
                  </h3>
                  <p className="text-[24px] text-[#0b5a14] leading-snug tabular-nums">
                    {formatCurrency(item.price)}
                  </p>

                  <button
                    type="button"
                    data-testid={`add-to-cart-${item.id}`}
                    onClick={() => onAddToCart(item)}
                    className="w-full h-[36px] mt-3 rounded-full border border-[#0b5a14] bg-[#b8f8b8] hover:bg-[#9bf09b] text-[#0b5a14] text-[23px] leading-none transition-colors cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <p className="text-[20px] text-[#0b5a14] mb-4">
                No items match “{searchQuery.trim()}”.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-6 py-2 rounded-full bg-[#04502a] text-white text-[16px] hover:bg-[#0b6b38] transition-colors cursor-pointer"
              >
                Show all menu items
              </button>
            </div>
          )}

          {/* Bottom-right View Cart Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              data-testid="view-cart-btn"
              onClick={onOpenCart}
              className="inline-flex items-center justify-center gap-3 w-[176px] h-[48px] rounded-[12px] bg-[#04502a] hover:bg-[#0b6b38] text-white text-[18px] transition-colors cursor-pointer shadow-md"
            >
              <span>View Cart</span>
              <ArrowRight className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </main>
    </section>
  );
};
