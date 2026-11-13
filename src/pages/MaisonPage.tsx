import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';
import { MONOGRAM_LOGO_SRC } from '../data/media.ts';
import { MediaFrame } from '../components/MediaFrame.tsx';

export const MaisonPage: React.FC = () => {
  const { language, navigate } = useStore();
  const copy = getCopy(language);

  return (
    <div>
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="max-w-3xl space-y-5">
          <div className="flex items-center gap-3">
            <img
              src={MONOGRAM_LOGO_SRC}
              alt="MF Monogram"
              referrerPolicy="no-referrer"
              className="w-10 h-10 object-contain mix-blend-multiply"
            />
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#6E6257]">
              {copy.maison.kicker}
            </span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-[#1C1917] leading-[1.08]">
            {copy.maison.title}
          </h1>
          <p className="text-base sm:text-lg text-[#4C433B] leading-relaxed pt-2">
            {copy.maison.intro}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8">
            <MediaFrame
              mediaKey="editorial_atelier_paris"
              alt="Maison Ferya Paris Studio"
              className="aspect-[16/10] w-full lg:h-full"
            />
          </div>
          <div className="lg:col-span-4">
            <MediaFrame
              mediaKey="editorial_collection_drapery"
              alt="Silk and Linen Drapery"
              className="aspect-[4/3] lg:aspect-auto w-full lg:h-full"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-[#E3DBD0] bg-[#F2EDE6]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {copy.maison.pillars.map((pillar) => (
              <div key={pillar.index} className="space-y-3 border-t border-[#1C1917]/20 pt-6">
                <span className="font-editorial text-lg text-[#6E6257] tabular-nums">
                  {pillar.index}
                </span>
                <h2 className="font-editorial text-2xl text-[#1C1917]">
                  {pillar.title}
                </h2>
                <p className="text-sm text-[#4C433B] leading-relaxed">{pillar.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-10 border-t border-[#E3DBD0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <p className="font-editorial italic text-2xl text-[#1C1917]">
              {language === 'fr'
                ? 'Explorer la garde-robe Maison Ferya'
                : 'Explore the Maison Ferya wardrobe'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.18em] hover:bg-[#332E2A] transition-colors"
            >
              <span>{copy.nav.shop}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
