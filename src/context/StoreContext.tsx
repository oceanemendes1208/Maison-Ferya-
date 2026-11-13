import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  CartItem,
  Collection,
  CustomerProfile,
  Language,
  Order,
  Product,
  ProductSize,
} from '../types/commerce.ts';

interface StoreContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  route: string;
  navigate: (path: string) => void;
  collections: Collection[];
  products: Product[];
  catalogLoading: boolean;
  refreshCatalog: () => Promise<void>;
  cart: CartItem[];
  bagOpen: boolean;
  setBagOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  addToCart: (product: Product, size: ProductSize, colorId: string) => void;
  updateCartQty: (productId: string, size: ProductSize, colorId: string, delta: number) => void;
  removeFromCart: (productId: string, size: ProductSize, colorId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  customer: CustomerProfile | null;
  customerOrders: Order[];
  setCustomerSession: (profile: CustomerProfile | null, orders?: Order[]) => void;
  refreshCustomerOrders: (email: string) => Promise<void>;
  lastOrder: Order | null;
  setLastOrder: (order: Order | null) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const LS_LANG = 'mf_lang_v1';
const LS_CART = 'mf_cart_v1';
const LS_WISHLIST = 'mf_wishlist_v1';
const LS_CUSTOMER = 'mf_customer_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LS_LANG);
    return saved === 'en' ? 'en' : 'fr';
  });

  const [route, setRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(LS_CART);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(LS_WISHLIST);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [customer, setCustomer] = useState<CustomerProfile | null>(() => {
    try {
      const raw = localStorage.getItem(LS_CUSTOMER);
      return raw ? (JSON.parse(raw) as CustomerProfile) : null;
    } catch {
      return null;
    }
  });

  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LS_LANG, lang);
    document.documentElement.lang = lang;
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const navigate = useCallback((path: string) => {
    if (path !== window.location.pathname + window.location.search) {
      window.history.pushState({}, '', path);
    }
    setRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setRoute(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const refreshCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/catalog');
      if (res.ok) {
        const data = (await res.json()) as { collections: Collection[]; products: Product[] };
        setCollections(data.collections);
        setProducts(data.products);
      }
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  const refreshCustomerOrders = useCallback(async (email: string) => {
    try {
      const res = await fetch(`/api/account/orders?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = (await res.json()) as { orders: Order[] };
        setCustomerOrders(data.orders);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (customer?.email) {
      refreshCustomerOrders(customer.email);
    }
  }, [customer?.email, refreshCustomerOrders]);

  useEffect(() => {
    localStorage.setItem(LS_CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(LS_WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  const setCustomerSession = useCallback((profile: CustomerProfile | null, orders?: Order[]) => {
    setCustomer(profile);
    if (profile) {
      localStorage.setItem(LS_CUSTOMER, JSON.stringify(profile));
      if (orders) setCustomerOrders(orders);
    } else {
      localStorage.removeItem(LS_CUSTOMER);
      setCustomerOrders([]);
    }
  }, []);

  const addToCart = useCallback((product: Product, size: ProductSize, colorId: string) => {
    const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0];
    const maxStock = product.stockBySize[size] ?? 0;
    if (maxStock <= 0) return;

    setCart((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === product.id && i.size === size && i.colorId === color.id
      );
      if (idx > -1) {
        const currentQty = prev[idx].quantity;
        if (currentQty >= maxStock) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: currentQty + 1 };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          nameFr: product.nameFr,
          nameEn: product.nameEn,
          priceEur: product.priceEur,
          size,
          colorId: color.id,
          colorNameFr: color.nameFr,
          colorNameEn: color.nameEn,
          colorHex: color.hex,
          mediaKey: product.mediaKeys[0],
          quantity: 1,
        },
      ];
    });
    setBagOpen(true);
  }, []);

  const updateCartQty = useCallback(
    (productId: string, size: ProductSize, colorId: string, delta: number) => {
      setCart((prev) =>
        prev
          .map((item) => {
            if (item.productId !== productId || item.size !== size || item.colorId !== colorId) {
              return item;
            }
            const product = products.find((p) => p.id === productId);
            const maxStock = product ? product.stockBySize[size] ?? 99 : 99;
            const nextQty = Math.min(maxStock, item.quantity + delta);
            return nextQty <= 0 ? null : { ...item, quantity: nextQty };
          })
          .filter((item): item is CartItem => item !== null)
      );
    },
    [products]
  );

  const removeFromCart = useCallback((productId: string, size: ProductSize, colorId: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.size === size && item.colorId === colorId)
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.priceEur * i.quantity, 0),
    [cart]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      language,
      setLanguage,
      route,
      navigate,
      collections,
      products,
      catalogLoading,
      refreshCatalog,
      cart,
      bagOpen,
      setBagOpen,
      searchOpen,
      setSearchOpen,
      assistantOpen,
      setAssistantOpen,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      cartCount,
      cartSubtotal,
      wishlist,
      toggleWishlist,
      customer,
      customerOrders,
      setCustomerSession,
      refreshCustomerOrders,
      lastOrder,
      setLastOrder,
    }),
    [
      language,
      setLanguage,
      route,
      navigate,
      collections,
      products,
      catalogLoading,
      refreshCatalog,
      cart,
      bagOpen,
      searchOpen,
      assistantOpen,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      cartCount,
      cartSubtotal,
      wishlist,
      toggleWishlist,
      customer,
      customerOrders,
      setCustomerSession,
      refreshCustomerOrders,
      lastOrder,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
