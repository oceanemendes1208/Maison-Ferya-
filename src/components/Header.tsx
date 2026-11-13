import React, { useState } from 'react';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';
import { MONOGRAM_LOGO_SRC } from '../data/media.ts';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    route,
    navigate,
    cartCount,
    setBagOpen,
    setSearchOpen,
    customer,
  } = useStore();
  const copy = getCopy(language);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: copy.nav.home },
    { path: '/collections', label: copy.nav.collections },
    { path: '/shop', label: copy.nav.shop },
    { path: '/maison', label: copy.nav.maison },
    { path: '/contact', label: copy.nav.contact },
  ];

  const isActive = (path: string) => {
    if (path === '/') return route === '/';
    return route.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-40">
      {bannerVisible && (
        <div className="bg-[#1C1917] text-[#FAF8F5] h-8 px-4 flex items-center justify-center relative text-[11px] tracking-[0.14em] uppercase">
          <p className="truncate pr-6">{copy.announcement}</p>
          <button
            type="button"
            onClick={() => setBannerVisible(false)}
            aria-label="Close announcement"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#FAF8F5]/70 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <header className="bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E3DBD0]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
          {/* Mobile menu trigger + Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Menu"
              className="lg:hidden p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#1C1917]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleNav('/');
              }}
              className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
            >
              <img
                src={MONOGRAM_LOGO_SRC}
                alt="MF"
                referrerPolicy="no-referrer"
                className="w-8 h-8 object-contain mix-blend-multiply"
              />
              <span className="font-editorial text-xl sm:text-[22px] tracking-[0.22em] font-medium text-[#1C1917] uppercase">
                MAISON FERYA
              </span>
            </a>
          </div>

          {/* Zone 2: Single-line navigation links */}
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.path);
                }}
                className={`relative py-1 text-[13px] tracking-[0.12em] uppercase whitespace-nowrap shrink-0 transition-colors duration-150 ${
                  isActive(item.path)
                    ? 'text-[#1C1917] font-medium'
                    : 'text-[#6E6257] hover:text-[#1C1917]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute left-0 right-0 -bottom-0.5 h-[1px] bg-[#1C1917] transition-transform duration-200 origin-left ${
                    isActive(item.path) ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            ))}
          </nav>

          {/* Zone 3: Utility & Primary Bag Action */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden sm:flex items-center text-[12px] tracking-[0.14em] uppercase text-[#6E6257]">
              <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`px-1.5 py-1 transition-colors ${
                  language === 'fr' ? 'text-[#1C1917] font-semibold underline underline-offset-4' : 'hover:text-[#1C1917]'
                }`}
              >
                FR
              </button>
              <span className="text-[#C8BEB0] select-none">/</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-1 transition-colors ${
                  language === 'en' ? 'text-[#1C1917] font-semibold underline underline-offset-4' : 'hover:text-[#1C1917]'
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={copy.nav.search}
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-[#1C1917] hover:text-[#6E6257] transition-colors"
            >
              <Search className="w-[18px] h-[18px] stroke-[1.5]" />
            </button>

            <button
              type="button"
              onClick={() => handleNav('/account')}
              aria-label={copy.nav.account}
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-[#1C1917] hover:text-[#6E6257] transition-colors relative"
            >
              <User className="w-[18px] h-[18px] stroke-[1.5]" />
              {customer && (
                <span className="sr-only">{customer.firstName}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setBagOpen(true)}
              className="flex items-center gap-2 px-3 py-2 min-h-[40px] text-[12px] tracking-[0.14em] uppercase text-[#1C1917] hover:text-[#6E6257] transition-colors whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
              <span className="hidden sm:inline">{copy.nav.bag}</span>
              <span className="tabular-nums text-[12px] font-medium">({cartCount})</span>
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E3DBD0] bg-[#FAF8F5] px-6 py-6 space-y-4">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(item.path);
                  }}
                  className={`py-3 text-base tracking-[0.1em] uppercase border-b border-[#EFEAE2] ${
                    isActive(item.path) ? 'text-[#1C1917] font-medium' : 'text-[#6E6257]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs uppercase tracking-[0.14em] text-[#6E6257]">
                {language === 'fr' ? 'Langue' : 'Language'}
              </span>
              <div className="flex items-center gap-3 text-xs tracking-[0.14em] uppercase">
                <button
                  type="button"
                  onClick={() => setLanguage('fr')}
                  className={`px-2 py-2 ${language === 'fr' ? 'text-[#1C1917] font-semibold underline' : 'text-[#6E6257]'}`}
                >
                  Français
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-2 ${language === 'en' ? 'text-[#1C1917] font-semibold underline' : 'text-[#6E6257]'}`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};
