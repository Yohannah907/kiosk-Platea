import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Clock3,
  CupSoda,
  History,
  Sparkles,
} from 'lucide-react';
import { PlateaLogo } from '../components/PlateaLogo';
import { LoyaltyTransaction } from '../types/kiosk';

interface LoyaltyPointsPageProps {
  loyaltyPoints: number;
  transactions: LoyaltyTransaction[];
  onBackToMenu: () => void;
}

export const LoyaltyPointsPage: React.FC<LoyaltyPointsPageProps> = ({
  loyaltyPoints,
  transactions,
  onBackToMenu,
}) => {
  const recentTransactions = transactions.slice(0, 20);

  return (
    <section
      data-testid="loyalty-points-page"
      aria-label="Loyalty Points"
      className="min-h-screen bg-white px-6 sm:px-10 lg:px-12 py-7"
    >
      <div className="max-w-[1165px] mx-auto">
        <header className="border-b border-[#4a7c52] pb-4 mb-5 max-w-[1041px]">
          <PlateaLogo
            onBack={onBackToMenu}
            backLabel="Back to Menu"
            variant="inline"
          />
        </header>

        <main className="max-w-[1041px]">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#52755a]">
              Student rewards
            </p>
            <h1 className="text-[28px] sm:text-[32px] font-medium text-[#0b5a14] leading-tight mt-1">
              Loyalty Points
            </h1>
            <p className="text-[17px] sm:text-[19px] text-[#35643b] mt-2">
              Earn points on qualifying orders and use them toward your next
              full order.
            </p>
          </div>

          <section
            aria-label="Current loyalty points"
            className="relative overflow-hidden rounded-[24px] border border-[#b8e4bf] bg-[#effff1] px-6 py-6 sm:px-8 sm:py-7"
          >
            <div className="absolute -right-10 -top-14 h-48 w-48 rounded-full border-[24px] border-white/40" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#35643b]">
                  <Award className="h-5 w-5" aria-hidden="true" />
                  <p className="text-[17px] sm:text-[18px] font-medium">Your points balance</p>
                </div>
                <p
                  data-testid="available-loyalty-points"
                  className="mt-2 text-[40px] sm:text-[46px] font-semibold leading-none tracking-tight text-[#0b5a14] tabular-nums"
                >
                  {loyaltyPoints}
                  {' '}
                  <span className="ml-1 text-[19px] sm:text-[21px] font-medium tracking-normal">
                    points
                  </span>
                </p>
              </div>
              <div className="max-w-[360px] rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-[15px] sm:text-base leading-relaxed text-[#35643b]">
                Use 10 points for ₱1.00 toward your full order at checkout.
                Your points balance is ready to use when it covers the total.
              </div>
            </div>
          </section>

          <section className="mt-7" aria-labelledby="earning-guidelines-title">
            <div className="mb-3">
              <h2
                id="earning-guidelines-title"
                className="text-[20px] sm:text-[22px] font-medium text-[#0b5a14]"
              >
                Ways to earn
              </h2>
              <p className="mt-1 text-[15px] text-[#52755a]">
                Stack eligible bonuses on qualifying paid orders.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <article
                data-testid="loyalty-guidelines"
                className="rounded-[18px] border border-[#c7e9cc] bg-white p-5 shadow-[0_2px_10px_rgba(11,90,20,0.04)]"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#effff1] text-[#0b5a14]">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-[16px] sm:text-[17px] font-semibold text-[#0b5a14]">
                  Every order
                </h3>
                <p className="mt-1 text-[15px] font-medium text-[#35643b]">
                  ₱40 minimum · 1 point per ₱20 paid
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-[#52755a]">
                  Orders below ₱40 earn no points. Orders paid with points do
                  not earn additional points.
                </p>
              </article>

              <article className="rounded-[18px] border border-[#c7e9cc] bg-white p-5 shadow-[0_2px_10px_rgba(11,90,20,0.04)]">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#effff1] text-[#0b5a14]">
                  <Clock3 className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-[16px] sm:text-[17px] font-semibold text-[#0b5a14]">
                  Happy Hour
                </h3>
                <p className="mt-1 text-[15px] font-medium text-[#35643b]">
                  2:00–4:30 PM · 2x eligible points
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-[#52755a]">
                  Get double points on qualifying snacks, desserts, and coffee
                  during Happy Hour.
                </p>
              </article>

              <article className="rounded-[18px] border border-[#c7e9cc] bg-white p-5 shadow-[0_2px_10px_rgba(11,90,20,0.04)]">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#effff1] text-[#0b5a14]">
                  <CupSoda className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-[16px] sm:text-[17px] font-semibold text-[#0b5a14]">
                  Bring your own tumbler
                </h3>
                <p className="mt-1 text-[15px] font-medium text-[#35643b]">
                  BYO · +2 bonus points
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-[#52755a]">
                  Bring your tumbler, then select the BYO option at checkout
                  with a paid drink.
                </p>
              </article>
            </div>
          </section>

          <section
            className="mt-7 rounded-[20px] border border-[#c7e9cc] bg-white p-5 sm:p-6"
            aria-labelledby="points-activity-title"
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-[#e4f2e6] pb-4">
              <div>
                <h2
                  id="points-activity-title"
                  className="text-[20px] sm:text-[22px] font-medium text-[#0b5a14]"
                >
                  Points activity
                </h2>
                <p className="mt-1 text-[15px] text-[#52755a]">
                  Your recent earnings, redemptions, and adjustments.
                </p>
              </div>
              {recentTransactions.length > 0 && (
                <span className="text-[13px] font-medium text-[#52755a]">
                  Latest {recentTransactions.length} transaction
                  {recentTransactions.length === 1 ? '' : 's'}
                </span>
              )}
            </div>

            {recentTransactions.length > 0 ? (
              <ul
                className="max-h-[360px] space-y-2 overflow-y-auto pr-1"
                data-testid="loyalty-activity"
              >
                {recentTransactions.map((transaction) => {
                  const isPositive = transaction.pointsChange > 0;
                  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
                  return (
                    <li
                      key={transaction.id}
                      className="flex items-center gap-3 rounded-xl bg-[#f7fcf8] px-3 py-3 sm:px-4"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          isPositive
                            ? 'bg-[#e2f5e6] text-[#087a37]'
                            : 'bg-[#fff0ed] text-[#a62d2d]'
                        }`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium text-[#0b5a14]">
                          {transaction.description}
                        </span>
                        <time
                          className="mt-1 block text-[13px] text-[#6b8770]"
                          dateTime={transaction.createdAt}
                        >
                          {new Date(transaction.createdAt).toLocaleString()}
                        </time>
                      </span>
                      <strong
                        className={`shrink-0 rounded-full px-3 py-1 text-[14px] tabular-nums ${
                          isPositive
                            ? 'bg-[#e2f5e6] text-[#087a37]'
                            : 'bg-[#fff0ed] text-[#a62d2d]'
                        }`}
                      >
                        {transaction.pointsChange > 0 ? '+' : ''}
                        {transaction.pointsChange} pts
                      </strong>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-xl bg-[#f7fcf8] px-5 py-8 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf7ec] text-[#35643b]">
                  <History className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-[15px] font-medium text-[#0b5a14]">
                  No points activity yet
                </p>
                <p className="mt-1 text-[15px] text-[#52755a]">
                  Your points will appear here after your first qualifying
                  order or reward redemption.
                </p>
              </div>
            )}
          </section>

          <button
            type="button"
            data-testid="loyalty-points-back-btn"
            onClick={onBackToMenu}
            className="w-full h-[52px] rounded-full bg-[#04502a] hover:bg-[#0b6b38] text-white text-[20px] font-bold mt-7 transition-colors cursor-pointer"
          >
            Back to Menu
          </button>

          <p className="text-center text-[16px] text-[#0b5a14] mt-3">
            Your campus served beautifully.
          </p>
        </main>
      </div>
    </section>
  );
};
