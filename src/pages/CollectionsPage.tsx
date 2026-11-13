import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';
import { MediaFrame } from '../components/MediaFrame.tsx';

export const CollectionsPage: React.FC = () => {
  const { language, collections, products, navigate } = useStore();
  const copy = getCopy(language);

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-14 sm:py-20">
      <header className="max-w-2xl mb-16">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#6E6257]">
          Maison Ferya
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#1C1917] mt-2">
          {copy.collectionsPage.title}
        </h1>
        <p className="text-base text-[#6E6257] mt-4 leading-relaxed">
          {copy.collectionsPage.subtitle}
        </p>
      </header>

      <div className="space-y-24">
        {collections.map((collection, idx) => {
          const name = language === 'fr' ? collection.nameFr : collection.nameEn;
          const tagline = language === 'fr' ? collection.taglineFr : collection.taglineEn;
          const description =
            language === 'fr' ? collection.descriptionFr : collection.descriptionEn;
          const count = products.filter((p) => p.collectionId === collection.id).length;
          const isReversed = idx % 2 === 1;

          return (
            <article
              key={collection.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-12 border-t border-[#E3DBD0]"
            >
              <div
                className={`lg:col-span-7 grid grid-cols-2 gap-4 ${
                  isReversed ? 'lg:order-2' : ''
                }`}
              >
                <MediaFrame
                  mediaKey={collection.heroMediaKey}
                  alt={name}
                  className="aspect-[3/4] w-full"
                />
                <MediaFrame
                  mediaKey={collection.secondaryMediaKey}
                  alt={`${name} lookbook`}
                  className="aspect-[3/4] w-full mt-8"
                />
              </div>

              <div
                className={`lg:col-span-5 space-y-5 ${
                  isReversed ? 'lg:order-1 lg:pr-6' : 'lg:pl-6'
                }`}
              >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#6E6257]">
                  <span>0{idx + 1}.</span>
                  <span aria-hidden="true">·</span>
                  <span>{collection.season}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{copy.shop.resultsCount(count)}</span>
                </div>

                <h2 className="font-editorial text-3xl sm:text-4xl text-[#1C1917]">
                  {name}
                </h2>
                <p className="font-editorial italic text-xl text-[#4C433B]">{tagline}</p>
                <p className="text-[15px] text-[#6E6257] leading-relaxed">{description}</p>

                <button
                  type="button"
                  onClick={() => navigate(`/shop?collection=${collection.id}`)}
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.18em] hover:bg-[#332E2A] transition-colors mt-2"
                >
                  <span>{copy.collectionsPage.shopThisCollection}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
