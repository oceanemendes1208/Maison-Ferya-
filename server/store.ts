import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { INITIAL_COLLECTIONS, INITIAL_PRODUCTS } from './catalogSeed.ts';
import type {
  Collection,
  ContactInquiry,
  CustomerProfile,
  Order,
  OrderItem,
  PaymentMethod,
  Product,
  ProductSize,
  ShippingMethod,
} from '../src/types/commerce.ts';

interface StoredCustomer extends CustomerProfile {
  passwordHash: string;
  salt: string;
}

interface DatabaseSchema {
  collections: Collection[];
  products: Product[];
  orders: Order[];
  customers: StoredCustomer[];
  inquiries: ContactInquiry[];
}

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = IS_SERVERLESS
  ? path.join(os.tmpdir(), 'maison-ferya-data')
  : path.resolve(process.cwd(), '.runtime-data');
const DB_PATH = path.join(DATA_DIR, 'maison-ferya-db.json');

let memoryDb: DatabaseSchema | null = null;

function createSeedDb(): DatabaseSchema {
  return {
    collections: INITIAL_COLLECTIONS.map((c) => ({ ...c })),
    products: INITIAL_PRODUCTS.map((p) => ({
      ...p,
      colors: p.colors.map((col) => ({ ...col })),
      mediaKeys: [...p.mediaKeys],
      stockBySize: { ...p.stockBySize },
    })),
    orders: [],
    customers: [],
    inquiries: [],
  };
}

function ensureDb(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      const initial = createSeedDb();
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      memoryDb = initial;
      return memoryDb;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!parsed.collections?.length) parsed.collections = INITIAL_COLLECTIONS;
    if (!parsed.products?.length) parsed.products = INITIAL_PRODUCTS;
    if (!parsed.orders) parsed.orders = [];
    if (!parsed.customers) parsed.customers = [];
    if (!parsed.inquiries) parsed.inquiries = [];
    memoryDb = parsed;
    return memoryDb;
  } catch {
    memoryDb = createSeedDb();
    return memoryDb;
  }
}

function saveDb(db: DatabaseSchema) {
  memoryDb = db;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch {
    // Keep in-memory state if filesystem is strictly read-only
  }
}

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt ?? crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { hash: derived, salt: actualSalt };
}

export function getCatalog() {
  const db = ensureDb();
  return {
    collections: db.collections,
    products: db.products,
  };
}

export function getProductBySlug(slug: string): Product | undefined {
  const db = ensureDb();
  return db.products.find((p) => p.slug === slug);
}

export interface CreateOrderInput {
  items: Array<{
    productId: string;
    size: ProductSize;
    colorId: string;
    quantity: number;
  }>;
  customer: Order['customer'];
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
}

export function createOrder(input: CreateOrderInput): { ok: true; order: Order } | { ok: false; error: string } {
  const db = ensureDb();

  if (!input.items || input.items.length === 0) {
    return { ok: false, error: 'Votre panier est vide / Your bag is empty.' };
  }

  const orderItems: OrderItem[] = [];
  let subtotalEur = 0;

  for (const item of input.items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) {
      return { ok: false, error: `Produit introuvable: ${item.productId}` };
    }
    const available = product.stockBySize[item.size] ?? 0;
    if (item.quantity <= 0 || available < item.quantity) {
      return {
        ok: false,
        error: `Stock insuffisant pour ${product.nameFr} (${item.size}). Disponible: ${available}.`,
      };
    }
    const color = product.colors.find((c) => c.id === item.colorId) ?? product.colors[0];
    orderItems.push({
      productId: product.id,
      sku: product.sku,
      nameFr: product.nameFr,
      nameEn: product.nameEn,
      size: item.size,
      colorNameFr: color.nameFr,
      colorNameEn: color.nameEn,
      quantity: item.quantity,
      unitPriceEur: product.priceEur,
    });
    subtotalEur += product.priceEur * item.quantity;
  }

  for (const item of input.items) {
    const product = db.products.find((p) => p.id === item.productId)!;
    product.stockBySize[item.size] = Math.max(0, product.stockBySize[item.size] - item.quantity);
  }

  const shippingEur =
    input.shippingMethod === 'express' ? 25 : subtotalEur >= 350 ? 0 : 15;
  const totalEur = subtotalEur + shippingEur;
  const sequence = 1042 + db.orders.length;
  const orderNumber = `MF-2026-${sequence}`;

  const order: Order = {
    id: crypto.randomUUID(),
    orderNumber,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
    paymentStatus: input.paymentMethod === 'transfer' ? 'authorized' : 'paid',
    paymentMethod: input.paymentMethod,
    shippingMethod: input.shippingMethod,
    subtotalEur,
    shippingEur,
    totalEur,
    customer: input.customer,
    items: orderItems,
  };

  db.orders.unshift(order);
  saveDb(db);

  return { ok: true, order };
}

export function findOrderByNumber(orderNumber: string): Order | undefined {
  const db = ensureDb();
  return db.orders.find(
    (o) => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase()
  );
}

export function getOrdersByEmail(email: string): Order[] {
  const db = ensureDb();
  const normalized = email.trim().toLowerCase();
  return db.orders.filter((o) => o.customer.email.trim().toLowerCase() === normalized);
}

export function registerCustomer(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): { ok: true; profile: CustomerProfile } | { ok: false; error: string } {
  const db = ensureDb();
  const email = payload.email.trim().toLowerCase();
  if (!email || !payload.password || payload.password.length < 6) {
    return {
      ok: false,
      error: 'Veuillez saisir un email valide et un mot de passe de 6 caractères minimum.',
    };
  }
  if (db.customers.some((c) => c.email.toLowerCase() === email)) {
    return {
      ok: false,
      error: 'Un compte existe déjà avec cette adresse email.',
    };
  }
  const { hash, salt } = hashPassword(payload.password);
  const stored: StoredCustomer = {
    id: crypto.randomUUID(),
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email,
    createdAt: new Date().toISOString(),
    passwordHash: hash,
    salt,
  };
  db.customers.push(stored);
  saveDb(db);
  const { passwordHash: _ph, salt: _s, ...profile } = stored;
  return { ok: true, profile };
}

export function loginCustomer(payload: {
  email: string;
  password: string;
}): { ok: true; profile: CustomerProfile } | { ok: false; error: string } {
  const db = ensureDb();
  const email = payload.email.trim().toLowerCase();
  const found = db.customers.find((c) => c.email.toLowerCase() === email);
  if (!found) {
    return { ok: false, error: 'Identifiants incorrects / Invalid credentials.' };
  }
  const { hash } = hashPassword(payload.password, found.salt);
  if (hash !== found.passwordHash) {
    return { ok: false, error: 'Identifiants incorrects / Invalid credentials.' };
  }
  const { passwordHash: _ph, salt: _s, ...profile } = found;
  return { ok: true, profile };
}

export function updateCustomerProfile(
  email: string,
  updates: Partial<Pick<CustomerProfile, 'firstName' | 'lastName' | 'phone' | 'address' | 'postalCode' | 'city' | 'country'>>
): CustomerProfile | null {
  const db = ensureDb();
  const idx = db.customers.findIndex((c) => c.email.toLowerCase() === email.trim().toLowerCase());
  if (idx === -1) return null;
  db.customers[idx] = { ...db.customers[idx], ...updates };
  saveDb(db);
  const { passwordHash: _ph, salt: _s, ...profile } = db.customers[idx];
  return profile;
}

export function createContactInquiry(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
  language: 'fr' | 'en';
}): ContactInquiry {
  const db = ensureDb();
  const inquiry: ContactInquiry = {
    id: crypto.randomUUID(),
    reference: `INQ-${String(100 + db.inquiries.length)}`,
    name: payload.name.trim(),
    email: payload.email.trim(),
    subject: payload.subject.trim(),
    message: payload.message.trim(),
    language: payload.language,
    createdAt: new Date().toISOString(),
  };
  db.inquiries.unshift(inquiry);
  saveDb(db);
  return inquiry;
}
