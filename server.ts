import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  createContactInquiry,
  createOrder,
  findOrderByNumber,
  getCatalog,
  getOrdersByEmail,
  getProductBySlug,
  loginCustomer,
  registerCustomer,
  updateCustomerProfile,
} from './server/store.ts';
import type { Language } from './src/types/commerce.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Catalog & Inventory
  app.get('/api/catalog', (_req, res) => {
    res.json(getCatalog());
  });

  app.get('/api/products/:slug', (req, res) => {
    const product = getProductBySlug(req.params.slug);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ product });
  });

  // Orders & Checkout
  app.post('/api/orders', (req, res) => {
    const { items, customer, shippingMethod, paymentMethod } = req.body ?? {};
    if (
      !customer?.firstName ||
      !customer?.lastName ||
      !customer?.email ||
      !customer?.address ||
      !customer?.city ||
      !customer?.postalCode
    ) {
      res.status(400).json({ error: 'Informations de livraison incomplètes / Incomplete shipping details.' });
      return;
    }

    const result = createOrder({
      items,
      customer,
      shippingMethod: shippingMethod === 'express' ? 'express' : 'standard',
      paymentMethod:
        paymentMethod === 'apple_pay' || paymentMethod === 'transfer' ? paymentMethod : 'card',
    });

    if (!result.ok) {
      const errMsg = (result as { ok: false; error: string }).error;
      res.status(400).json({ error: errMsg });
      return;
    }

    res.status(201).json({ order: result.order });
  });

  app.get('/api/orders/:orderNumber', (req, res) => {
    const order = findOrderByNumber(req.params.orderNumber);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json({ order });
  });

  // Client Account
  app.post('/api/auth/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body ?? {};
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ error: 'Tous les champs sont requis / All fields are required.' });
      return;
    }
    const result = registerCustomer({ firstName, lastName, email, password });
    if (!result.ok) {
      const errMsg = (result as { ok: false; error: string }).error;
      res.status(400).json({ error: errMsg });
      return;
    }
    res.status(201).json({ profile: result.profile, orders: getOrdersByEmail(result.profile.email) });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: 'Email et mot de passe requis / Email and password required.' });
      return;
    }
    const result = loginCustomer({ email, password });
    if (!result.ok) {
      const errMsg = (result as { ok: false; error: string }).error;
      res.status(401).json({ error: errMsg });
      return;
    }
    res.json({ profile: result.profile, orders: getOrdersByEmail(result.profile.email) });
  });

  app.put('/api/account/profile', (req, res) => {
    const { email, ...updates } = req.body ?? {};
    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }
    const updated = updateCustomerProfile(email, updates);
    if (!updated) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    res.json({ profile: updated });
  });

  app.get('/api/account/orders', (req, res) => {
    const email = String(req.query.email || '');
    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }
    res.json({ orders: getOrdersByEmail(email) });
  });

  // Contact Inquiries
  app.post('/api/contact', (req, res) => {
    const { name, email, subject, message, language } = req.body ?? {};
    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'Merci de remplir tous les champs / Please complete all fields.' });
      return;
    }
    const inquiry = createContactInquiry({
      name,
      email,
      subject,
      message,
      language: language === 'en' ? 'en' : 'fr',
    });
    res.status(201).json({ inquiry });
  });

  // Virtual Concierge (Server-side Gemini API)
  app.post('/api/assistant', async (req, res) => {
    const { messages, language = 'fr' } = (req.body ?? {}) as {
      messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
      language?: Language;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Conversation messages required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          language === 'en'
            ? 'The Maison Ferya advisor service is currently unavailable. Please configure GEMINI_API_KEY in Settings > Secrets.'
            : 'La conseillère Maison Ferya est momentanément indisponible. Veuillez vérifier GEMINI_API_KEY dans Settings > Secrets.',
      });
      return;
    }

    const { collections, products } = getCatalog();

    // Check if the latest message mentions an order number like MF-2026-1042
    const lastUserMessage = messages[messages.length - 1]?.content ?? '';
    const orderMatch = lastUserMessage.match(/MF-\d{4}-\d+/i);
    const matchedOrder = orderMatch ? findOrderByNumber(orderMatch[0]) : undefined;

    const catalogContext = products
      .map((p) => {
        const col = collections.find((c) => c.id === p.collectionId);
        const stockStr = Object.entries(p.stockBySize)
          .map(([size, count]) => `${size}: ${count}`)
          .join(', ');
        const colorsStr = p.colors.map((c) => `${c.nameFr} / ${c.nameEn}`).join(', ');
        return `- ${p.nameFr} (${p.nameEn}) [SKU: ${p.sku}] — Collection: ${col?.nameFr ?? p.collectionId} — Prix: ${p.priceEur} € — Couleurs: ${colorsStr} — Matière: ${p.compositionFr} — Coupe: ${p.fitNotesFr} / ${p.fitNotesEn} — Stock actuel: {${stockStr}}`;
      })
      .join('\n');

    const orderContext = matchedOrder
      ? `\n\nCOMMANDE TROUVÉE (${matchedOrder.orderNumber}): Statut=${matchedOrder.status}, Paiement=${matchedOrder.paymentStatus}, Total=${matchedOrder.totalEur} €, Articles=${matchedOrder.items.map((i) => `${i.quantity}x ${i.nameFr} (${i.size})`).join(', ')}.`
      : orderMatch
        ? `\n\nNuméro de commande mentionné (${orderMatch[0]}): introuvable dans la base actuelle.`
        : '';

    const systemInstruction = `Tu es la conseillère privée de Maison Ferya, une maison de prêt-à-porter féminin parisienne alliant élégance intemporelle, modernité et raffinement.
Langue active de l'interface : ${language === 'en' ? 'Anglais (English)' : 'Français'}. Réponds toujours dans la langue utilisée par la cliente (français ou anglais), avec un ton chaleureux, élégant, naturel, précis et professionnel.

RÈGLES STRICTES :
1. N'invente JAMAIS de faux avis clients, de fausses promotions, de faux codes promo ni de produits absents du catalogue ci-dessous.
2. Appuie-toi uniquement sur le catalogue en direct, les disponibilités par taille et les informations maison ci-dessous.
3. Sois concise et utile (2 à 4 phrases bien structurées ou une courte liste claire lorsque la cliente compare des pièces).
4. Pour les tailles, rappelle nos repères Maison Ferya :
   - XS (FR 34) : Poitrine 80-84 cm · Taille 62-66 cm · Hanches 88-92 cm
   - S (FR 36) : Poitrine 84-88 cm · Taille 66-70 cm · Hanches 92-96 cm
   - M (FR 38) : Poitrine 88-92 cm · Taille 70-74 cm · Hanches 96-100 cm
   - L (FR 40) : Poitrine 92-97 cm · Taille 74-79 cm · Hanches 100-105 cm
   - XL (FR 42) : Poitrine 97-102 cm · Taille 79-84 cm · Hanches 105-110 cm
5. Livraison & Retours : Livraison standard offerte dès 350 € d'achat (sinon 15 €), livraison express 25 €. Retours gracieux sous 30 jours dans l'emballage d'origine.

CATALOGUE EN DIRECT :
${catalogContext}${orderContext}`;

    try {
      const contents = messages.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text?.trim() || (
        language === 'en'
          ? 'I am at your disposal for any question regarding our silhouettes, sizing, or your order.'
          : 'Je reste à votre disposition pour toute question concernant nos silhouettes, nos tailles ou votre commande.'
      );

      res.json({ reply });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Assistant error';
      res.status(500).json({ error: message });
    }
  });

  // Vite middleware in development, static assets in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maison Ferya server listening on http://localhost:${PORT}`);
  });
}

startServer();
