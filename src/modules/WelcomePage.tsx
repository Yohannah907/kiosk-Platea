import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { PlateaLogo } from '../components/PlateaLogo';

interface WelcomePageProps {
  onStartOrder: () => void;
  onOpenAdmin: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onStartOrder,
  onOpenAdmin,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <section
      data-testid="welcome-page"
      aria-label="Welcome Page"
      className="mint-grain-surface min-h-screen flex items-center justify-center px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-6"
    >
      <div className="w-full max-w-[1120px] grid grid-cols-1 lg:grid-cols-2 gap-7 lg:gap-14 items-center">
        <div className="flex flex-col justify-between py-1">
          <div>
            <PlateaLogo />
          </div>

          <div className="my-6 lg:my-0">
            <p className="uppercase tracking-[0.12em] text-[15px] sm:text-[17px] text-[#0b5a14] mb-3">
              Campus dining reimagined
            </p>
            <h1 className="text-[34px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.12] text-[#0b5a14] mb-5 max-w-[440px]">
              Your campus, served beautifully.
            </h1>
            <p className="text-[17px] sm:text-[19px] leading-[1.4] text-[#0b5a14] max-w-[430px] mb-6">
              Discover your favorite meals and make every campus break delicious.
            </p>
            <button
              type="button"
              data-testid="welcome-start-btn"
              onClick={onStartOrder}
              className="inline-flex items-center justify-center gap-3 bg-[#073d09] hover:bg-[#0b5a14] text-[#b8f8b8] rounded-[14px] w-full max-w-[360px] h-[48px] text-[17px] sm:text-[19px] uppercase tracking-wide transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Start your order</span>
              <ArrowRight className="w-6 h-6" strokeWidth={2} />
            </button>
          </div>

          <div className="pt-4">
            <button
              type="button"
              data-testid="open-admin-btn"
              onClick={onOpenAdmin}
              className="text-[16px] text-[#0b5a14]/80 hover:text-[#04502a] underline underline-offset-4 bg-transparent border-0 cursor-pointer"
            >
              Kiosk Admin Console
            </button>
          </div>
        </div>

        <div className="rounded-[14px] overflow-hidden bg-[#273045] h-[230px] sm:h-[320px] lg:h-[min(68vh,540px)] shadow-lg flex items-center justify-center">
          {!imgError ? (
            <img
              src="/images/welcome.jpg"
              alt="Shrimp fried rice topped with fried egg and fresh lime"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover block"
            />
          ) : (
            <div className="text-center p-10 text-white/90">
              <div className="text-7xl mb-3" aria-hidden="true">🍳</div>
              <p className="text-xl">Fresh campus meals prepared daily</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
