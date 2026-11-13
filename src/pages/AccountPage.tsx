import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';
import type { Order } from '../types/commerce.ts';
import { ProductCard } from '../components/ProductCard.tsx';

export const AccountPage: React.FC = () => {
  const {
    language,
    customer,
    customerOrders,
    setCustomerSession,
    products,
    wishlist,
  } = useStore();
  const copy = getCopy(language);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [lookupNumber, setLookupNumber] = useState('');
  const [lookupResult, setLookupResult] = useState<Order | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [profileAddress, setProfileAddress] = useState(customer?.address ?? '');
  const [profileCity, setProfileCity] = useState(customer?.city ?? '');
  const [profilePostal, setProfilePostal] = useState(customer?.postalCode ?? '');
  const [profileSaved, setProfileSaved] = useState(false);

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        mode === 'login'
          ? { email, password }
          : { firstName, lastName, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        profile?: typeof customer;
        orders?: Order[];
        error?: string;
      };

      if (!res.ok || !data.profile) {
        setAuthError(data.error || 'Authentication failed.');
      } else {
        setCustomerSession(data.profile, data.orders ?? []);
        setProfileAddress(data.profile.address ?? '');
        setProfileCity(data.profile.city ?? '');
        setProfilePostal(data.profile.postalCode ?? '');
      }
    } catch {
      setAuthError('Network error.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOrderLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupNumber.trim()) return;
    setLookupError(null);
    setLookupResult(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(lookupNumber.trim())}`);
      if (!res.ok) {
        setLookupError(
          language === 'fr' ? 'Commande introuvable.' : 'Order number not found.'
        );
      } else {
        const data = (await res.json()) as { order: Order };
        setLookupResult(data.order);
      }
    } catch {
      setLookupError('Network error.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    const res = await fetch('/api/account/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customer.email,
        address: profileAddress,
        city: profileCity,
        postalCode: profilePostal,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { profile: typeof customer };
      if (data.profile) {
        setCustomerSession(data.profile);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
      }
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-16">
      <header className="mb-12 border-b border-[#E3DBD0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#6E6257]">
            Maison Ferya
          </span>
          <h1 className="font-editorial text-4xl text-[#1C1917] mt-1">
            {customer ? copy.account.welcome(customer.firstName) : copy.account.title}
          </h1>
          <p className="text-sm text-[#6E6257] mt-2">{copy.account.subtitle}</p>
        </div>

        {customer && (
          <button
            type="button"
            onClick={() => setCustomerSession(null)}
            className="self-start sm:self-auto px-4 py-2 border border-[#D8CFC2] text-xs uppercase tracking-[0.14em] text-[#1C1917] hover:border-[#1C1917]"
          >
            {copy.account.logout}
          </button>
        )}
      </header>

      {!customer ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sign in / Register */}
          <div className="lg:col-span-6 bg-[#F2EDE6] border border-[#E3DBD0] p-6 sm:p-10">
            <div className="flex border-b border-[#D8CFC2] mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setAuthError(null);
                }}
                className={`pb-3 pr-6 text-xs uppercase tracking-[0.16em] border-b-2 transition-colors ${
                  mode === 'login'
                    ? 'border-[#1C1917] text-[#1C1917] font-medium'
                    : 'border-transparent text-[#6E6257]'
                }`}
              >
                {copy.account.signInTab}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setAuthError(null);
                }}
                className={`pb-3 px-6 text-xs uppercase tracking-[0.16em] border-b-2 transition-colors ${
                  mode === 'register'
                    ? 'border-[#1C1917] text-[#1C1917] font-medium'
                    : 'border-transparent text-[#6E6257]'
                }`}
              >
                {copy.account.registerTab}
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#6E6257] mb-1.5">
                      {copy.checkout.firstName}
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#D8CFC2] px-3.5 py-2.5 text-sm"
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
                      className="w-full bg-[#FAF8F5] border border-[#D8CFC2] px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-[#6E6257] mb-1.5">
                  {copy.checkout.email}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D8CFC2] px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-[#6E6257] mb-1.5">
                  {copy.account.password}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D8CFC2] px-3.5 py-2.5 text-sm"
                />
              </div>

              {authError && <p className="text-xs text-[#7D2C22]">{authError}</p>}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.18em] hover:bg-[#332E2A]"
              >
                {mode === 'login' ? copy.account.signInBtn : copy.account.registerBtn}
              </button>
            </form>
          </div>

          {/* Guest Order Lookup + Wishlist */}
          <div className="lg:col-span-6 space-y-10">
            <div className="border border-[#E3DBD0] p-6 sm:p-8 space-y-4">
              <h2 className="font-editorial text-2xl text-[#1C1917]">
                {language === 'fr' ? 'Suivi de commande invité' : 'Guest Order Tracking'}
              </h2>
              <form onSubmit={handleOrderLookup} className="flex gap-2">
                <input
                  type="text"
                  value={lookupNumber}
                  onChange={(e) => setLookupNumber(e.target.value)}
                  placeholder={copy.account.orderLookupPlaceholder}
                  className="flex-1 bg-white border border-[#D8CFC2] px-3.5 py-2.5 text-sm"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.14em]"
                >
                  {copy.account.orderLookupBtn}
                </button>
              </form>
              {lookupError && <p className="text-xs text-[#7D2C22]">{lookupError}</p>}
              {lookupResult && (
                <div className="pt-3 border-t border-[#E3DBD0] text-sm space-y-1 tabular-nums">
                  <p className="font-medium text-[#1C1917]">
                    {lookupResult.orderNumber} · {lookupResult.status}
                  </p>
                  <p className="text-xs text-[#6E6257]">
                    {lookupResult.items.length} article(s) · {lookupResult.totalEur} €
                  </p>
                </div>
              )}
            </div>

            {wishlistProducts.length > 0 && (
              <div>
                <h2 className="font-editorial text-2xl text-[#1C1917] mb-5">
                  {copy.account.wishlistTitle}
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {wishlistProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Orders */}
            <div className="lg:col-span-7 space-y-5">
              <h2 className="font-editorial text-2xl text-[#1C1917]">
                {copy.account.ordersTitle}
              </h2>
              {customerOrders.length === 0 ? (
                <p className="text-sm text-[#6E6257] border border-[#E3DBD0] p-6">
                  {copy.account.noOrders}
                </p>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-[#E3DBD0] p-5 bg-[#FAF8F5] space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFEAE2] pb-3 text-sm tabular-nums">
                        <span className="font-medium text-[#1C1917]">{order.orderNumber}</span>
                        <span className="text-xs uppercase tracking-[0.14em] text-[#6E6257]">
                          {new Date(order.createdAt).toLocaleDateString()} · {order.status}
                        </span>
                        <span className="font-medium text-[#1C1917]">{order.totalEur} €</span>
                      </div>
                      <ul className="text-xs text-[#4C433B] space-y-1">
                        {order.items.map((item, i) => (
                          <li key={i}>
                            {item.quantity} × {language === 'fr' ? item.nameFr : item.nameEn} (
                            {item.size})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-5">
              <form
                onSubmit={handleSaveProfile}
                className="bg-[#F2EDE6] border border-[#E3DBD0] p-6 space-y-4"
              >
                <h2 className="font-editorial text-2xl text-[#1C1917]">
                  {copy.account.profileTitle}
                </h2>
                <p className="text-xs text-[#6E6257]">{customer.email}</p>
                <div>
                  <label className="block text-xs text-[#6E6257] mb-1">
                    {copy.checkout.address}
                  </label>
                  <input
                    type="text"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#D8CFC2] px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#6E6257] mb-1">
                      {copy.checkout.postalCode}
                    </label>
                    <input
                      type="text"
                      value={profilePostal}
                      onChange={(e) => setProfilePostal(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#D8CFC2] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6E6257] mb-1">
                      {copy.checkout.city}
                    </label>
                    <input
                      type="text"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#D8CFC2] px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.16em]"
                >
                  {copy.account.saveProfile}
                </button>
                {profileSaved && (
                  <p className="text-xs text-[#1C1917]">{copy.account.profileSaved}</p>
                )}
              </form>
            </div>
          </div>

          {/* Wishlist */}
          <div>
            <h2 className="font-editorial text-2xl text-[#1C1917] mb-6">
              {copy.account.wishlistTitle}
            </h2>
            {wishlistProducts.length === 0 ? (
              <p className="text-sm text-[#6E6257]">{copy.account.noWishlist}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {wishlistProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
