import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';
import { MediaFrame } from './MediaFrame.tsx';

export const SearchOverlay: React.FC = () => {
  const { language, products, searchOpen, setSearchOpen, navigate } = useStore();
  const copy = getCopy(language);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 4);
    return products.filter((p) => {
      const hay = [
        p.nameFr,
        p.nameEn,
        p.subtitleFr,
        p.subtitleEn,
        p.descriptionFr,
        p.descriptionEn,
        ...p.colors.flatMap((c) => [c.nameFr, c.nameEn]),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [products, query]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1917]/40 backdrop-blur-[2px] flex items-start justify-center">
      <div className="w-full bg-[#FAF8F5] border-b border-[#E3DBD0] shadow-xl">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="flex items-center gap-4 border-b border-[#1C1917] pb-3">
            <Search className="w-5 h-5 text-[#6E6257] shrink-0 stroke-[1.5]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.search.placeholder}
              className="w-full bg-transparent text-base sm:text-lg text-[#1C1917] placeholder:text-[#8E8276] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label={copy.search.close}
              className="p-2 text-[#1C1917] hover:text-[#6E6257]"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          <div className="mt-8">
            {results.length === 0 ? (
              <p className="text-sm text-[#6E6257] py-6">{copy.search.noResults}</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {results.map((product) => {
                  const name = language === 'fr' ? product.nameFr : product.nameEn;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        navigate(`/product/${product.slug}`);
                      }}
                      className="text-left group"
                    >
                      <MediaFrame
                        mediaKey={product.mediaKeys[0]}
                        alt={name}
                        className="aspect-[3/4] w-full mb-3"
                      />
                      <p className="font-editorial text-lg text-[#1C1917] group-hover:underline">
                        {name}
                      </p>
                      <p className="text-xs tabular-nums text-[#6E6257] mt-0.5">
                        {product.priceEur} €
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
