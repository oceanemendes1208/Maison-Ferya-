import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';
import { MONOGRAM_LOGO_SRC } from '../data/media.ts';

export const Footer: React.FC = () => {
  const { language, setLanguage, navigate } = useStore();
  const copy = getCopy(language);

  return (
    <footer className="bg-[#F2EDE6] border-t border-[#E3DBD0] text-[#1C1917]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={MONOGRAM_LOGO_SRC}
              alt="Maison Ferya"
              referrerPolicy="no-referrer"
              className="w-10 h-10 object-contain mix-blend-multiply"
            />
            <span className="font-editorial text-2xl tracking-[0.22em] uppercase">
              MAISON FERYA
            </span>
          </div>
          <p className="text-sm text-[#6E6257] max-w-sm leading-relaxed">
            {copy.footer.brandNote}
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs tracking-[0.14em] uppercase text-[#6E6257]">
            <button
              type="button"
              onClick={() => setLanguage('fr')}
              className={language === 'fr' ? 'text-[#1C1917] font-semibold underline' : 'hover:text-[#1C1917]'}
            >
              Français
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={language === 'en' ? 'text-[#1C1917] font-semibold underline' : 'hover:text-[#1C1917]'}
            >
              English
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-[#6E6257] font-sans font-medium">
            {copy.footer.colMaison}
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button type="button" onClick={() => navigate('/collections')} className="hover:underline">
                {copy.nav.collections}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/shop')} className="hover:underline">
                {copy.nav.shop}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/maison')} className="hover:underline">
                {copy.nav.maison}
              </button>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2 space-y-3">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-[#6E6257] font-sans font-medium">
            {copy.footer.colService}
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button type="button" onClick={() => navigate('/account')} className="hover:underline">
                {copy.nav.account}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/contact')} className="hover:underline">
                {copy.nav.contact}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/info/shipping')} className="hover:underline">
                {copy.footer.shippingLink}
              </button>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3 space-y-3">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-[#6E6257] font-sans font-medium">
            {copy.footer.colInfo}
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button type="button" onClick={() => navigate('/info/care')} className="hover:underline">
                {copy.footer.careLink}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/info/legal')} className="hover:underline">
                {copy.footer.legalLink}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E3DBD0]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6E6257]">
          <span>{copy.footer.copyright}</span>
          <span>24 Rue du Faubourg Saint-Honoré · Paris</span>
        </div>
      </div>
    </footer>
  );
};
