import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';
import type { ProductCategory, ProductSize } from '../types/commerce.ts';
import { ProductCard } from '../components/ProductCard.tsx';

const ALL_SIZES: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL'];
const CATEGORIES: ProductCategory[] = ['tops', 'dresses', 'tailoring', 'trousers', 'knitwear'];

export const ShopPage: React.FC = () => {
  const { language, collections, products, route } = useStore();
  const copy = getCopy(language);

  const initialCollection = useMemo(() => {
    const idx = route.indexOf('?');
    if (idx === -1) return 'all';
    const params = new URLSearchParams(route.slice(idx + 1));
    return params.get('collection') || 'all';
  }, [route]);

  const [selectedCollection, setSelectedCollection] = useState<string>(initialCollection);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');

  useEffect(() => {
    setSelectedCollection(initialCollection);
  }, [initialCollection]);

  const availableColors = useMemo(() => {
    const map = new Map<string, { id: string; nameFr: string; nameEn: string; hex: string }>();
    for (const p of products) {
      for (const c of p.colors) {
        if (!map.has(c.id)) map.set(c.id, c);
      }
    }
    return Array.from(map.values());
  }, [products]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      if (selectedCollection !== 'all' && p.collectionId !== selectedCollection) return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (selectedSize !== 'all') {
        const stock = p.stockBySize[selectedSize as ProductSize] ?? 0;
        if (stock <= 0) return false;
      }
      if (selectedColor !== 'all' && !p.colors.some((c) => c.id === selectedColor)) {
        return false;
      }
      return true;
    });

    if (sortBy === 'price_asc') {
      return [...list].sort((a, b) => a.priceEur - b.priceEur);
    }
    if (sortBy === 'price_desc') {
      return [...list].sort((a, b) => b.priceEur - a.priceEur);
    }
    return list;
  }, [products, selectedCollection, selectedCategory, selectedSize, selectedColor, sortBy]);

  const hasActiveFilters =
    selectedCollection !== 'all' ||
    selectedCategory !== 'all' ||
    selectedSize !== 'all' ||
    selectedColor !== 'all';

  const resetFilters = () => {
    setSelectedCollection('all');
    setSelectedCategory('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setSortBy('featured');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-14 sm:py-16">
      <header className="mb-10">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#6E6257]">
          Maison Ferya
        </span>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
          <div>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[#1C1917]">
              {copy.shop.title}
            </h1>
            <p className="text-sm text-[#6E6257] mt-2">{copy.shop.subtitle}</p>
          </div>
          <span className="text-xs uppercase tracking-[0.14em] text-[#6E6257] tabular-nums">
            {copy.shop.resultsCount(filteredProducts.length)}
          </span>
        </div>
      </header>

      {/* Interactive Filter Toolbar */}
      <div className="border-y border-[#E3DBD0] py-4 mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCollection('all')}
            className={`px-3.5 py-2 text-xs uppercase tracking-[0.14em] transition-colors whitespace-nowrap ${
              selectedCollection === 'all'
                ? 'bg-[#1C1917] text-[#FAF8F5]'
                : 'text-[#6E6257] hover:text-[#1C1917] border border-[#E3DBD0]'
            }`}
          >
            {copy.shop.allCollections}
          </button>
          {collections.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCollection(c.id)}
              className={`px-3.5 py-2 text-xs uppercase tracking-[0.14em] transition-colors whitespace-nowrap ${
                selectedCollection === c.id
                  ? 'bg-[#1C1917] text-[#FAF8F5]'
                  : 'text-[#6E6257] hover:text-[#1C1917] border border-[#E3DBD0]'
              }`}
            >
              {language === 'fr' ? c.nameFr : c.nameEn}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label={copy.shop.allCategories}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#FAF8F5] border border-[#D8CFC2] px-3 py-2 text-xs text-[#1C1917]"
          >
            <option value="all">{copy.shop.allCategories}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {copy.categories[cat]}
              </option>
            ))}
          </select>

          <select
            aria-label={copy.shop.allSizes}
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="bg-[#FAF8F5] border border-[#D8CFC2] px-3 py-2 text-xs text-[#1C1917]"
          >
            <option value="all">{copy.shop.allSizes}</option>
            {ALL_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            aria-label={copy.shop.allColors}
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="bg-[#FAF8F5] border border-[#D8CFC2] px-3 py-2 text-xs text-[#1C1917]"
          >
            <option value="all">{copy.shop.allColors}</option>
            {availableColors.map((col) => (
              <option key={col.id} value={col.id}>
                {language === 'fr' ? col.nameFr : col.nameEn}
              </option>
            ))}
          </select>

          <select
            aria-label={copy.shop.sortLabel}
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'featured' | 'price_asc' | 'price_desc')
            }
            className="bg-[#FAF8F5] border border-[#D8CFC2] px-3 py-2 text-xs text-[#1C1917]"
          >
            <option value="featured">{copy.shop.sortFeatured}</option>
            <option value="price_asc">{copy.shop.sortPriceAsc}</option>
            <option value="price_desc">{copy.shop.sortPriceDesc}</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs uppercase tracking-[0.14em] text-[#6E6257] underline underline-offset-4 hover:text-[#1C1917] px-1"
            >
              {copy.shop.resetFilters}
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <p className="font-editorial text-2xl text-[#1C1917]">{copy.shop.emptyTitle}</p>
          <p className="text-sm text-[#6E6257]">{copy.shop.emptyHint}</p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-6 py-3 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.16em]"
          >
            {copy.shop.resetFilters}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
