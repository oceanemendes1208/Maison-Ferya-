import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';
import type { Order, PaymentMethod, ShippingMethod } from '../types/commerce.ts';
import { MediaFrame } from '../components/MediaFrame.tsx';

export const CheckoutPage: React.FC = () => {
  const {
    language,
    cart,
    cartSubtotal,
    clearCart,
    setBagOpen,
    navigate,
    customer,
    refreshCatalog,
    refreshCustomerOrders,
    lastOrder,
    setLastOrder,
  } = useStore();
  const copy = getCopy(language);

  const [firstName, setFirstName] = useState(customer?.firstName ?? '');
  const [lastName, setLastName] = useState(customer?.lastName ?? '');
  const [email, setEmail] = useState(customer?.email ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [address, setAddress] = useState(customer?.address ?? '');
  const [postalCode, setPostalCode] = useState(customer?.postalCode ?? '');
  const [city, setCity] = useState(customer?.city ?? '');
  const [country, setCountry] = useState(customer?.country ?? 'France');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(lastOrder);

  const shippingCost =
    shippingMethod === 'express' ? 25 : cartSubtotal >= 350 ? 0 : 15;
  const totalEur = cartSubtotal + shippingCost;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.productId,
            size: i.size,
            colorId: i.colorId,
            quantity: i.quantity,
          })),
          customer: {
            firstName,
            lastName,
            email,
            phone,
            address,
            postalCode,
            city,
            country,
          },
          shippingMethod,
          paymentMethod,
        }),
      });

      const data = (await res.json()) as { order?: Order; error?: string };
      if (!res.ok || !data.order) {
        setError(data.error || 'Unable to process order.');
      } else {
        setConfirmedOrder(data.order);
        setLastOrder(data.order);
        clearCart();
        await refreshCatalog();
        if (customer?.email) {
          await refreshCustomerOrders(customer.email);
        }
      }
    } catch {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="bg-[#F2EDE6] border border-[#D8CFC2] p-8 sm:p-12 space-y-6">
          <div className="flex items-center gap-3 text-[#1C1917]">
            <CheckCircle2 className="w-7 h-7 stroke-[1.5]" />
            <h1 className="font-editorial text-3xl sm:text-4xl">
              {copy.checkout.confirmedTitle}
            </h1>
          </div>

          <p className="text-sm text-[#4C433B] leading-relaxed">
            {copy.checkout.confirmedSubtitle}
          </p>

          <div className="border-y border-[#D8CFC2] py-4 flex items-center justify-between text-sm">
            <span className="text-[#6E6257] uppercase tracking-[0.14em] text-xs">
              {copy.checkout.orderNumberLabel}
            </span>
            <span className="font-medium tabular-nums text-[#1C1917]">
              {confirmedOrder.orderNumber}
            </span>
          </div>

          <ul className="divide-y divide-[#E3DBD0] text-sm">
            {confirmedOrder.items.map((item, idx) => (
              <li key={idx} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-editorial text-lg text-[#1C1917]">
                    {language === 'fr' ? item.nameFr : item.nameEn}
                  </p>
                  <p className="text-xs text-[#6E6257]">
                    {language === 'fr' ? item.colorNameFr : item.colorNameEn} · {item.size} ×{' '}
                    {item.quantity}
                  </p>
                </div>
                <span className="tabular-nums text-[#1C1917]">
                  {item.unitPriceEur * item.quantity} €
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-[#D8CFC2] pt-4 space-y-2 text-sm tabular-nums">
            <div className="flex justify-between text-[#6E6257]">
              <span>{copy.bag.subtotal}</span>
              <span>{confirmedOrder.subtotalEur} €</span>
            </div>
            <div className="flex justify-between text-[#6E6257]">
              <span>{copy.checkout.shippingLabel}</span>
              <span>
                {confirmedOrder.shippingEur === 0
                  ? copy.checkout.free
                  : `${confirmedOrder.shippingEur} €`}
              </span>
            </div>
            <div className="flex justify-between font-medium text-[#1C1917] text-base pt-2 border-t border-[#E3DBD0]">
              <span>{copy.checkout.totalLabel}</span>
              <span>{confirmedOrder.totalEur} €</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                setLastOrder(null);
                setConfirmedOrder(null);
                navigate('/shop');
              }}
              className="flex-1 py-3.5 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.16em] hover:bg-[#332E2A]"
            >
              {copy.checkout.continueShopping}
            </button>
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="flex-1 py-3.5 border border-[#1C1917] text-[#1C1917] text-xs uppercase tracking-[0.16em] hover:bg-[#1C1917] hover:text-[#FAF8F5] transition-colors"
            >
              {copy.checkout.viewAccountOrders}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-5">
        <h1 className="font-editorial text-3xl text-[#1C1917]">{copy.bag.empty}</h1>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="px-6 py-3.5 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.16em]"
        >
          {copy.bag.browseCta}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-12 sm:py-16">
      <button
        type="button"
        onClick={() => setBagOpen(true)}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#6E6257] hover:text-[#1C1917] mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
        <span>{copy.checkout.backToBag}</span>
      </button>

      <h1 className="font-editorial text-4xl text-[#1C1917] mb-10">{copy.checkout.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Form */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-10">
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-[0.18em] text-[#6E6257] border-b border-[#E3DBD0] pb-2 font-sans">
              {copy.checkout.contactSection}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#6E6257] mb-1.5">
                  {copy.checkout.firstName}
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white border border-[#D8CFC2] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6E6257] mb-1.5">
                  {copy.checkout.lastName}
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white border border-[#D8CFC2] px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#6E6257] mb-1.5">
                  {copy.checkout.email}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#D8CFC2] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6E6257] mb-1.5">
                  {copy.checkout.phone}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-[#D8CFC2] px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-[0.18em] text-[#6E6257] border-b border-[#E3DBD0] pb-2 font-sans">
              {copy.checkout.shippingSection}
            </h2>
            <div>
              <label className="block text-xs text-[#6E6257] mb-1.5">
                {copy.checkout.address}
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white border border-[#D8CFC2] px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[#6E6257] mb-1.5">
                  {copy.checkout.postalCode}
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-white border border-[#D8CFC2] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6E6257] mb-1.5">
                  {copy.checkout.city}
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white border border-[#D8CFC2] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6E6257] mb-1.5">
                  {copy.checkout.country}
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-white border border-[#D8CFC2] px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-[0.18em] text-[#6E6257] border-b border-[#E3DBD0] pb-2 font-sans">
              {copy.checkout.deliveryMethod}
            </h2>
            <label className="flex items-center justify-between p-4 border border-[#D8CFC2] bg-[#FAF8F5] cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingMethod === 'standard'}
                  onChange={() => setShippingMethod('standard')}
                />
                <span className="text-sm">{copy.checkout.standardShipping}</span>
              </div>
              <span className="text-sm tabular-nums">
                {cartSubtotal >= 350 ? copy.checkout.free : '15 €'}
              </span>
            </label>

            <label className="flex items-center justify-between p-4 border border-[#D8CFC2] bg-[#FAF8F5] cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingMethod === 'express'}
                  onChange={() => setShippingMethod('express')}
                />
                <span className="text-sm">{copy.checkout.expressShipping}</span>
              </div>
              <span className="text-sm tabular-nums">25 €</span>
            </label>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-[0.18em] text-[#6E6257] border-b border-[#E3DBD0] pb-2 font-sans">
              {copy.checkout.paymentMethod}
            </h2>
            <div className="space-y-2.5">
              {(
                [
                  { id: 'card', label: copy.checkout.cardPayment },
                  { id: 'apple_pay', label: copy.checkout.applePay },
                  { id: 'transfer', label: copy.checkout.transferPayment },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-3 p-4 border border-[#D8CFC2] bg-[#FAF8F5] cursor-pointer"
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-[#6E6257] flex items-center gap-2 pt-1">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>{copy.checkout.cardNote}</span>
            </p>
          </section>

          {error && (
            <div className="p-4 border border-[#9B3B2E]/30 bg-[#9B3B2E]/5 text-sm text-[#7D2C22]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.18em] hover:bg-[#332E2A] disabled:opacity-50 transition-colors"
          >
            {submitting
              ? copy.checkout.processing
              : `${copy.checkout.placeOrder} · ${totalEur} €`}
          </button>
        </form>

        {/* Order Summary */}
        <aside className="lg:col-span-5 bg-[#F2EDE6] border border-[#E3DBD0] p-6 sm:p-8 lg:sticky lg:top-28 space-y-6">
          <h2 className="font-editorial text-2xl text-[#1C1917]">
            {copy.checkout.summaryTitle}
          </h2>

          <ul className="divide-y divide-[#E3DBD0]">
            {cart.map((item) => {
              const name = language === 'fr' ? item.nameFr : item.nameEn;
              const colorName = language === 'fr' ? item.colorNameFr : item.colorNameEn;
              return (
                <li
                  key={`${item.productId}-${item.size}-${item.colorId}`}
                  className="py-4 flex gap-4"
                >
                  <MediaFrame
                    mediaKey={item.mediaKey}
                    alt={name}
                    className="w-16 h-22 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-editorial text-lg text-[#1C1917] leading-tight">
                      {name}
                    </p>
                    <p className="text-xs text-[#6E6257] mt-1">
                      {colorName} · {item.size} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums text-[#1C1917] shrink-0">
                    {item.priceEur * item.quantity} €
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-[#D8CFC2] pt-4 space-y-2.5 text-sm tabular-nums">
            <div className="flex justify-between text-[#6E6257]">
              <span>{copy.bag.subtotal}</span>
              <span>{cartSubtotal} €</span>
            </div>
            <div className="flex justify-between text-[#6E6257]">
              <span>{copy.checkout.shippingLabel}</span>
              <span>{shippingCost === 0 ? copy.checkout.free : `${shippingCost} €`}</span>
            </div>
            <div className="flex justify-between text-base font-medium text-[#1C1917] pt-3 border-t border-[#D8CFC2]">
              <span>{copy.checkout.totalLabel}</span>
              <span>{totalEur} €</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
