import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Heart, Ruler, X } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';
import type { ProductSize } from '../types/commerce.ts';
import { MediaFrame } from '../components/MediaFrame.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

const SIZES: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL'];

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const {
    language,
    products,
    collections,
    navigate,
    addToCart,
    wishlist,
    toggleWishlist,
  } = useStore();
  const copy = getCopy(language);

  const product = products.find((p) => p.slug === slug);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState('');
  const [selectedSize, setSelectedSize] = useState<ProductSize>('S');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [addedRecently, setAddedRecently] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIdx(0);
      setSelectedColorId(product.colors[0]?.id ?? '');
      const firstAvailable = SIZES.find((s) => (product.stockBySize[s] ?? 0) > 0) ?? 'S';
      setSelectedSize(firstAvailable);
      setAddedRecently(false);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-24 text-center space-y-4">
        <p className="font-editorial text-3xl text-[#1C1917]">
          {language === 'fr' ? 'Pièce introuvable.' : 'Piece not found.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.16em]"
        >
          {copy.product.backToShop}
        </button>
      </div>
    );
  }

  const collection = collections.find((c) => c.id === product.collectionId);
  const name = language === 'fr' ? product.nameFr : product.nameEn;
  const subtitle = language === 'fr' ? product.subtitleFr : product.subtitleEn;
  const description = language === 'fr' ? product.descriptionFr : product.descriptionEn;
  const composition = language === 'fr' ? product.compositionFr : product.compositionEn;
  const care = language === 'fr' ? product.careFr : product.careEn;
  const fitNotes = language === 'fr' ? product.fitNotesFr : product.fitNotesEn;

  const activeColor =
    product.colors.find((c) => c.id === selectedColorId) ?? product.colors[0];
  const stockForSelected = product.stockBySize[selectedSize] ?? 0;
  const isWishlisted = wishlist.includes(product.id);

  const related = products
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const handleAdd = () => {
    if (stockForSelected <= 0) return;
    addToCart(product, selectedSize, activeColor.id);
    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 1800);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
      <button
        type="button"
        onClick={() => navigate('/shop')}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#6E6257] hover:text-[#1C1917] mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
        <span>{copy.product.backToShop}</span>
      </button>

      {/* Main 2-column PDP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <MediaFrame
            mediaKey={product.mediaKeys[activeImageIdx] ?? product.mediaKeys[0]}
            alt={name}
            className="aspect-[3/4] w-full"
          />
          {product.mediaKeys.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.mediaKeys.map((key, idx) => (
                <button
                  key={`${key}-${idx}`}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`border transition-colors ${
                    activeImageIdx === idx ? 'border-[#1C1917]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <MediaFrame mediaKey={key} alt={`${name} ${idx + 1}`} className="aspect-[3/4] w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Sticky Purchase Module */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          <div className="border-b border-[#E3DBD0] pb-6 space-y-2">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#6E6257]">
              <span>{copy.categories[product.category]}</span>
              {collection && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{language === 'fr' ? collection.nameFr : collection.nameEn}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{product.sku}</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl text-[#1C1917] leading-tight">
              {name}
            </h1>
            <p className="text-sm text-[#6E6257]">{subtitle}</p>
            <p className="text-xl font-medium tabular-nums text-[#1C1917] pt-2">
              {product.priceEur} €
            </p>
          </div>

          {/* Color Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em]">
              <span className="text-[#6E6257]">{copy.product.color}</span>
              <span className="text-[#1C1917]">
                {language === 'fr' ? activeColor.nameFr : activeColor.nameEn}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColorId(c.id)}
                  aria-label={language === 'fr' ? c.nameFr : c.nameEn}
                  className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${
                    activeColor.id === c.id
                      ? 'border-[#1C1917] ring-1 ring-[#1C1917] ring-offset-2 ring-offset-[#FAF8F5]'
                      : 'border-[#C8BEB0]'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Size Selector & Size Guide */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-[#6E6257]">
                {copy.product.size}
              </span>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-[#1C1917] underline underline-offset-4 hover:text-[#6E6257]"
              >
                <Ruler className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{copy.product.sizeGuide}</span>
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {SIZES.map((s) => {
                const count = product.stockBySize[s] ?? 0;
                const disabled = count <= 0;
                const active = selectedSize === s;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedSize(s)}
                    className={`py-3 text-xs tracking-[0.12em] uppercase border transition-colors ${
                      disabled
                        ? 'border-[#E3DBD0] text-[#B8AEA2] line-through cursor-not-allowed'
                        : active
                          ? 'border-[#1C1917] bg-[#1C1917] text-[#FAF8F5]'
                          : 'border-[#D8CFC2] text-[#1C1917] hover:border-[#1C1917]'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-[#6E6257] tabular-nums">
              {stockForSelected > 0
                ? copy.product.inStock(stockForSelected)
                : copy.product.outOfStock}
            </p>
          </div>

          {/* Primary Purchase Actions */}
          <div className="flex items-stretch gap-3 pt-1">
            <button
              type="button"
              disabled={stockForSelected <= 0}
              onClick={handleAdd}
              className="flex-1 py-4 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.18em] hover:bg-[#332E2A] disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              {addedRecently ? (
                <>
                  <Check className="w-4 h-4 stroke-[1.75]" />
                  <span>{copy.product.addedFeedback}</span>
                </>
              ) : (
                <span>
                  {stockForSelected > 0 ? copy.product.addToBag : copy.product.outOfStock}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label="Wishlist"
              className="w-14 border border-[#D8CFC2] flex items-center justify-center text-[#1C1917] hover:border-[#1C1917] transition-colors"
            >
              <Heart className={`w-4 h-4 stroke-[1.5] ${isWishlisted ? 'fill-[#1C1917]' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-[#6E6257] leading-relaxed">{copy.product.shippingNote}</p>

          {/* Editorial Product Details */}
          <div className="border-t border-[#E3DBD0] pt-6 space-y-5 text-sm leading-relaxed text-[#4C433B]">
            <p>{description}</p>

            <dl className="space-y-3 pt-2 border-t border-[#EFEAE2]">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-[#6E6257]">
                  {copy.product.composition}
                </dt>
                <dd className="mt-0.5 text-[#1C1917]">{composition}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-[#6E6257]">
                  {copy.product.fit}
                </dt>
                <dd className="mt-0.5 text-[#1C1917]">{fitNotes}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-[#6E6257]">
                  {copy.product.care}
                </dt>
                <dd className="mt-0.5 text-[#1C1917]">{care}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Related Pieces */}
      <section className="mt-24 pt-16 border-t border-[#E3DBD0]">
        <h2 className="font-editorial text-3xl text-[#1C1917] mb-10">
          {copy.product.relatedTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#D8CFC2] max-w-xl w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E3DBD0]">
              <div>
                <h2 className="font-editorial text-2xl text-[#1C1917]">
                  {copy.sizeGuide.title}
                </h2>
                <p className="text-xs text-[#6E6257] mt-1">{copy.sizeGuide.intro}</p>
              </div>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                aria-label={copy.sizeGuide.close}
                className="p-2 text-[#1C1917] hover:text-[#6E6257]"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            <div className="overflow-x-auto my-6">
              <table className="w-full text-left text-xs sm:text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-[#1C1917] text-[11px] uppercase tracking-[0.12em] text-[#6E6257]">
                    {copy.sizeGuide.headers.map((h) => (
                      <th key={h} className="py-2.5 pr-4 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEAE2]">
                  {copy.sizeGuide.rows.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, idx) => (
                        <td
                          key={idx}
                          className={`py-3 pr-4 ${idx === 0 ? 'font-medium text-[#1C1917]' : 'text-[#4C433B]'}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-[#6E6257] leading-relaxed">{copy.sizeGuide.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
};
