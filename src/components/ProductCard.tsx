import React from 'react';
import { Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';
import type { Product } from '../types/commerce.ts';
import { MediaFrame } from './MediaFrame.tsx';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, navigate, collections, wishlist, toggleWishlist } = useStore();
  const copy = getCopy(language);
  const collection = collections.find((c) => c.id === product.collectionId);
  const name = language === 'fr' ? product.nameFr : product.nameEn;
  const collectionName = collection
    ? language === 'fr'
      ? collection.nameFr
      : collection.nameEn
    : '';
  const isWishlisted = wishlist.includes(product.id);
  const totalStock = Object.values(product.stockBySize).reduce((a, b) => a + b, 0);

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <button
          type="button"
          onClick={() => navigate(`/product/${product.slug}`)}
          className="block w-full text-left focus-visible:outline-2 focus-visible:outline-[#1C1917]"
        >
          <MediaFrame
            mediaKey={product.mediaKeys[0]}
            hoverMediaKey={product.mediaKeys[1]}
            alt={name}
            className="aspect-[3/4] w-full"
          />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-[#FAF8F5]/85 backdrop-blur-sm text-[#1C1917] opacity-90 hover:opacity-100 transition-opacity"
        >
          <Heart
            className={`w-4 h-4 stroke-[1.5] ${isWishlisted ? 'fill-[#1C1917]' : ''}`}
          />
        </button>
      </div>

      <div className="pt-4 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#6E6257]">
          <span>{copy.categories[product.category]}</span>
          {collectionName && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{collectionName}</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate(`/product/${product.slug}`)}
          className="text-left font-editorial text-[19px] leading-snug text-[#1C1917] group-hover:text-[#6E6257] transition-colors"
        >
          {name}
        </button>

        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[14px] text-[#1C1917] tabular-nums font-medium">
            {totalStock > 0 ? `${product.priceEur} €` : copy.shop.soldOut}
          </span>

          <div className="flex items-center gap-1.5" aria-label={copy.product.color}>
            {product.colors.map((color) => (
              <span
                key={color.id}
                title={language === 'fr' ? color.nameFr : color.nameEn}
                className="w-3 h-3 rounded-full border border-[#1C1917]/20"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};
