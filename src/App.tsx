/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { BagDrawer } from './components/BagDrawer.tsx';
import { SearchOverlay } from './components/SearchOverlay.tsx';
import { VirtualAdvisor } from './components/VirtualAdvisor.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { CollectionsPage } from './pages/CollectionsPage.tsx';
import { ShopPage } from './pages/ShopPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { MaisonPage } from './pages/MaisonPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { AccountPage } from './pages/AccountPage.tsx';
import { InfoPage } from './pages/InfoPage.tsx';

const RouterView: React.FC = () => {
  const { route } = useStore();
  const pathname = route.split('?')[0] || '/';

  if (pathname === '/' || pathname === '') {
    return <HomePage />;
  }
  if (pathname === '/collections') {
    return <CollectionsPage />;
  }
  if (pathname === '/shop') {
    return <ShopPage />;
  }
  if (pathname.startsWith('/product/')) {
    const slug = pathname.replace('/product/', '');
    return <ProductDetailPage slug={slug} />;
  }
  if (pathname === '/maison') {
    return <MaisonPage />;
  }
  if (pathname === '/contact') {
    return <ContactPage />;
  }
  if (pathname === '/checkout') {
    return <CheckoutPage />;
  }
  if (pathname === '/account') {
    return <AccountPage />;
  }
  if (pathname.startsWith('/info/')) {
    const section = pathname.replace('/info/', '');
    if (section === 'care' || section === 'legal') {
      return <InfoPage section={section} />;
    }
    return <InfoPage section="shipping" />;
  }

  return <HomePage />;
};

export default function App() {
  return (
    <StoreProvider>
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
        <Header />
        <main className="flex-1">
          <RouterView />
        </main>
        <Footer />
        <BagDrawer />
        <SearchOverlay />
        <VirtualAdvisor />
      </div>
    </StoreProvider>
  );
}
