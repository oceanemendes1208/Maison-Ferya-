import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';
import { MediaFrame } from './MediaFrame.tsx';

export const BagDrawer: React.FC = () => {
  const {
    language,
    cart,
    bagOpen,
    setBagOpen,
    updateCartQty,
    removeFromCart,
    cartSubtotal,
    navigate,
  } = useStore();
  const copy = getCopy(language);

  if (!bagOpen) return null;

  const freeThreshold = 350;
  const remaining = Math.max(0, freeThreshold - cartSubtotal);
  const progress = Math.min(100, Math.round((cartSubtotal / freeThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-[#1C1917]/40 backdrop-blur-[2px] transition-opacity"
        onClick={() => setBagOpen(false)}
      />

      <aside
        aria-label={copy.bag.title}
        className="relative w-full max-w-md bg-[#FAF8F5] h-full flex flex-col border-l border-[#E3DBD0] shadow-2xl z-10"
      >
        <div className="px-6 py-5 border-b border-[#E3DBD0] flex items-center justify-between">
          <h2 className="font-editorial text-2xl tracking-wide text-[#1C1917]">
            {copy.bag.title}
          </h2>
          <button
            type="button"
            onClick={() => setBagOpen(false)}
            aria-label={copy.sizeGuide.close}
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-[#1C1917] hover:text-[#6E6257]"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {cart.length > 0 && (
          <div className="px-6 py-3.5 bg-[#F2EDE6] border-b border-[#E3DBD0]">
            <p className="text-xs text-[#1C1917] mb-2">
              {remaining > 0
                ? copy.bag.freeShippingProgress(remaining)
                : copy.bag.freeShippingUnlocked}
            </p>
            <div className="h-[2px] w-full bg-[#E3DBD0] overflow-hidden">
              <div
                className="h-full bg-[#1C1917] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-5">
              <p className="text-sm text-[#6E6257]">{copy.bag.empty}</p>
              <button
                type="button"
                onClick={() => {
                  setBagOpen(false);
                  navigate('/shop');
                }}
                className="px-6 py-3 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.16em] hover:bg-[#332E2A] transition-colors"
              >
                {copy.bag.browseCta}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#E3DBD0]">
              {cart.map((item) => {
                const name = language === 'fr' ? item.nameFr : item.nameEn;
                const colorName = language === 'fr' ? item.colorNameFr : item.colorNameEn;
                return (
                  <li
                    key={`${item.productId}-${item.size}-${item.colorId}`}
                    className="py-5 first:pt-0 flex gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setBagOpen(false);
                        navigate(`/product/${item.slug}`);
                      }}
                      className="w-20 h-28 shrink-0"
                    >
                      <MediaFrame
                        mediaKey={item.mediaKey}
                        alt={name}
                        className="w-full h-full"
                      />
                    </button>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBagOpen(false);
                              navigate(`/product/${item.slug}`);
                            }}
                            className="text-left font-editorial text-lg leading-tight text-[#1C1917] hover:underline"
                          >
                            {name}
                          </button>
                          <span className="text-sm tabular-nums text-[#1C1917] shrink-0">
                            {item.priceEur * item.quantity} €
                          </span>
                        </div>
                        <p className="text-xs text-[#6E6257] mt-1">
                          {colorName} · {copy.product.size} {item.size}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <div className="inline-flex items-center border border-[#D8CFC2]">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              updateCartQty(item.productId, item.size, item.colorId, -1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-[#1C1917] hover:bg-[#F2EDE6]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              updateCartQty(item.productId, item.size, item.colorId, 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-[#1C1917] hover:bg-[#F2EDE6]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item.productId, item.size, item.colorId)
                          }
                          className="text-xs text-[#6E6257] underline underline-offset-4 hover:text-[#1C1917]"
                        >
                          {copy.bag.remove}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-[#E3DBD0] bg-[#FAF8F5] space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-[#6E6257]">
                {copy.bag.subtotal}
              </span>
              <span className="text-lg font-medium tabular-nums text-[#1C1917]">
                {cartSubtotal} €
              </span>
            </div>
            <p className="text-xs text-[#6E6257]">{copy.bag.shippingEstimate}</p>
            <button
              type="button"
              onClick={() => {
                setBagOpen(false);
                navigate('/checkout');
              }}
              className="w-full py-3.5 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.18em] hover:bg-[#332E2A] transition-colors"
            >
              {copy.bag.checkoutCta}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
