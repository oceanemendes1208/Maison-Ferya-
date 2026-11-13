import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';

interface InfoPageProps {
  section: 'shipping' | 'care' | 'legal';
}

export const InfoPage: React.FC<InfoPageProps> = ({ section }) => {
  const { language, navigate } = useStore();
  const copy = getCopy(language);
  const content = copy.infoPages[section] ?? copy.infoPages.shipping;

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-20">
      <div className="flex items-center gap-6 border-b border-[#E3DBD0] pb-4 mb-10 text-xs uppercase tracking-[0.14em]">
        <button
          type="button"
          onClick={() => navigate('/info/shipping')}
          className={section === 'shipping' ? 'text-[#1C1917] font-semibold underline underline-offset-8' : 'text-[#6E6257] hover:text-[#1C1917]'}
        >
          {copy.footer.shippingLink}
        </button>
        <button
          type="button"
          onClick={() => navigate('/info/care')}
          className={section === 'care' ? 'text-[#1C1917] font-semibold underline underline-offset-8' : 'text-[#6E6257] hover:text-[#1C1917]'}
        >
          {copy.footer.careLink}
        </button>
        <button
          type="button"
          onClick={() => navigate('/info/legal')}
          className={section === 'legal' ? 'text-[#1C1917] font-semibold underline underline-offset-8' : 'text-[#6E6257] hover:text-[#1C1917]'}
        >
          {copy.footer.legalLink}
        </button>
      </div>

      <h1 className="font-editorial text-4xl text-[#1C1917] mb-10">{content.title}</h1>

      <div className="space-y-10">
        {content.sections.map((s) => (
          <section key={s.heading} className="space-y-2 border-t border-[#EFEAE2] pt-6">
            <h2 className="font-editorial text-2xl text-[#1C1917]">{s.heading}</h2>
            <p className="text-[15px] text-[#4C433B] leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
};
