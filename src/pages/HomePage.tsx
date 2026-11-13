import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';
import { HERO_VIDEO_SRC } from '../data/media.ts';
import { MediaFrame } from '../components/MediaFrame.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

export const HomePage: React.FC = () => {
  const { language, collections, products, navigate } = useStore();
  const copy = getCopy(language);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);

  return (
    <div>
      {/* 1. Full-Width Google Flow Hero Video */}
      <section className="relative w-full h-[76vh] min-h-[520px] max-h-[860px] overflow-hidden bg-[#221E1A]">
        <video
          src={HERO_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Measured bottom contrast scrim so typography stays legible across every frame */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none"
        />

        <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 sm:px-12 pb-10 sm:pb-14 flex flex-col justify-end">
          <div className="max-w-xl flex flex-col items-start gap-3">
            <span className="text-[11px] uppercase tracking-[0.26em] text-[#FAF8F5]/85">
              {copy.hero.kicker}
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl tracking-[0.14em] uppercase text-[#FAF8F5] font-normal">
              MAISON FERYA
            </h1>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="mt-2 inline-flex items-center gap-3 px-6 py-3 border border-[#FAF8F5]/80 text-[#FAF8F5] text-xs uppercase tracking-[0.18em] backdrop-blur-[2px] hover:bg-[#FAF8F5] hover:text-[#1C1917] transition-colors duration-200 whitespace-nowrap"
            >
              <span>{copy.hero.cta}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Curated Collections */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-20 sm:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#1C1917]">
              {copy.home.collectionsTitle}
            </h2>
            <p className="text-sm text-[#6E6257] mt-2 max-w-lg">
              {copy.home.collectionsSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/collections')}
            className="self-start md:self-auto text-xs uppercase tracking-[0.16em] text-[#1C1917] border-b border-[#1C1917] pb-1 hover:text-[#6E6257] hover:border-[#6E6257] transition-colors whitespace-nowrap"
          >
            {copy.nav.collections}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection) => {
            const name = language === 'fr' ? collection.nameFr : collection.nameEn;
            const tagline = language === 'fr' ? collection.taglineFr : collection.taglineEn;
            return (
              <div key={collection.id} className="group flex flex-col">
                <button
                  type="button"
                  onClick={() => navigate(`/shop?collection=${collection.id}`)}
                  className="text-left block w-full"
                >
                  <MediaFrame
                    mediaKey={collection.heroMediaKey}
                    hoverMediaKey={collection.secondaryMediaKey}
                    alt={name}
                    className="aspect-[3/4] w-full"
                  />
                </button>
                <div className="pt-5 flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[#6E6257]">
                    {collection.season}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/shop?collection=${collection.id}`)}
                    className="text-left font-editorial text-2xl text-[#1C1917] group-hover:text-[#6E6257] transition-colors"
                  >
                    {name}
                  </button>
                  <p className="text-sm text-[#6E6257] leading-relaxed">{tagline}</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/shop?collection=${collection.id}`)}
                    className="mt-2 self-start inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#1C1917] hover:text-[#6E6257] transition-colors"
                  >
                    <span>{copy.home.exploreCollection}</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Selected Pieces */}
      <section className="border-t border-[#E3DBD0] bg-[#FAF8F5]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-20 sm:py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#1C1917]">
                {copy.home.selectedTitle}
              </h2>
              <p className="text-sm text-[#6E6257] mt-2 max-w-lg">
                {copy.home.selectedSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="self-start md:self-auto text-xs uppercase tracking-[0.16em] text-[#1C1917] border-b border-[#1C1917] pb-1 hover:text-[#6E6257] hover:border-[#6E6257] transition-colors whitespace-nowrap"
            >
              {copy.home.viewAllShop}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Savoir-Faire Editorial Split */}
      <section className="border-t border-[#E3DBD0] bg-[#F2EDE6]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7">
            <MediaFrame
              mediaKey="editorial_atelier_paris"
              alt="Maison Ferya Atelier Paris"
              className="h-72 sm:h-96 lg:h-full min-h-[420px] w-full"
            />
          </div>

          <div className="lg:col-span-5 px-6 sm:px-12 py-14 lg:py-20 flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#6E6257]">
              {copy.home.atelierKicker}
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#1C1917] mt-3 leading-tight">
              {copy.home.atelierTitle}
            </h2>
            <p className="text-[15px] text-[#4C433B] leading-relaxed mt-5">
              {copy.home.atelierBody}
            </p>
            <button
              type="button"
              onClick={() => navigate('/maison')}
              className="mt-8 self-start inline-flex items-center gap-3 px-6 py-3.5 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.18em] hover:bg-[#332E2A] transition-colors"
            >
              <span>{copy.home.atelierCta}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
