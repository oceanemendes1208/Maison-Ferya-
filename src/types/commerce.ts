export type Language = 'fr' | 'en';

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

export type ProductCategory = 'tops' | 'dresses' | 'tailoring' | 'trousers' | 'knitwear';

export type MediaKey =
  | 'silk_halter_ivory'
  | 'slip_dress_champagne'
  | 'linen_blazer_sand'
  | 'wide_trousers_ecru'
  | 'evening_dress_espresso'
  | 'cashmere_knit_noir'
  | 'editorial_atelier_paris'
  | 'editorial_collection_drapery';

export interface ProductColorOption {
  id: string;
  nameFr: string;
  nameEn: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  collectionId: string;
  category: ProductCategory;
  nameFr: string;
  nameEn: string;
  subtitleFr: string;
  subtitleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  compositionFr: string;
  compositionEn: string;
  careFr: string;
  careEn: string;
  fitNotesFr: string;
  fitNotesEn: string;
  priceEur: number;
  colors: ProductColorOption[];
  mediaKeys: MediaKey[];
  stockBySize: Record<ProductSize, number>;
  featured: boolean;
}

export interface Collection {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  season: string;
  taglineFr: string;
  taglineEn: string;
  descriptionFr: string;
  descriptionEn: string;
  heroMediaKey: MediaKey;
  secondaryMediaKey: MediaKey;
}

export interface CartItem {
  productId: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  priceEur: number;
  size: ProductSize;
  colorId: string;
  colorNameFr: string;
  colorNameEn: string;
  colorHex: string;
  mediaKey: MediaKey;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  sku: string;
  nameFr: string;
  nameEn: string;
  size: ProductSize;
  colorNameFr: string;
  colorNameEn: string;
  quantity: number;
  unitPriceEur: number;
}

export type ShippingMethod = 'standard' | 'express';
export type PaymentMethod = 'card' | 'apple_pay' | 'transfer';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'confirmed' | 'preparing' | 'shipped';
  paymentStatus: 'authorized' | 'paid';
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  subtotalEur: number;
  shippingEur: number;
  totalEur: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
  };
  items: OrderItem[];
}

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  createdAt: string;
}

export interface ContactInquiry {
  id: string;
  reference: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  language: Language;
  createdAt: string;
}
