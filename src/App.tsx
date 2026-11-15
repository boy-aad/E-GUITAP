/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { CataloguePage } from './pages/CataloguePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { QuoteModal } from './components/QuoteModal';
import { CatalogueDetailModal } from './components/CatalogueDetailModal';
import { LegalModals } from './components/LegalModals';
import { CATALOGUE_DATA, CatalogueItem } from './data/catalogue';
import { COMPANY_DATA } from './data/company';
import { MessageSquare } from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [selectedCatalogueItem, setSelectedCatalogueItem] = useState<CatalogueItem | null>(null);

  // Modals state
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteInitialDomain, setQuoteInitialDomain] = useState<string>('btp');
  const [quoteInitialRef, setQuoteInitialRef] = useState<string>('');
  const [legalModalType, setLegalModalType] = useState<'legal' | 'privacy' | null>(null);

  // Sync with browser hash for easy navigation & back button support
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '').trim();
      if (!hash) {
        setCurrentRoute('home');
        return;
      }

      if (hash.startsWith('catalogue/')) {
        const slug = hash.replace('catalogue/', '');
        const found = CATALOGUE_DATA.find((item) => item.slug === slug || item.id === slug);
        if (found) {
          setSelectedCatalogueItem(found);
          setCurrentRoute('catalogue');
          return;
        }
      }

      const validRoutes = ['home', 'about', 'activities', 'catalogue', 'projects', 'contact'];
      if (validRoutes.includes(hash)) {
        setCurrentRoute(hash);
      } else {
        setCurrentRoute('not-found');
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuoteModal = (domain = 'btp', itemRef = '') => {
    setQuoteInitialDomain(domain);
    setQuoteInitialRef(itemRef);
    setQuoteModalOpen(true);
  };

  const handleSelectCatalogueItem = (item: CatalogueItem) => {
    setSelectedCatalogueItem(item);
    window.location.hash = `#/catalogue/${item.slug}`;
  };

  const handleCloseDetailModal = () => {
    setSelectedCatalogueItem(null);
    if (currentRoute === 'catalogue') {
      window.location.hash = '#/catalogue';
    } else {
      window.location.hash = `#/${currentRoute}`;
    }
  };

  // WhatsApp quick floating click-to-chat
  const handleQuickWhatsApp = () => {
    const text = encodeURIComponent(
      `Bonjour E.GUITAP,\n\nJe vous contacte depuis votre site institutionnel pour une demande de renseignement.`
    );
    window.open(`https://wa.me/${COMPANY_DATA.whatsappNumber}?text=${text}`, '_blank');
  };

  // Related items for the selected catalog modal
  const relatedItems = selectedCatalogueItem
    ? CATALOGUE_DATA.filter(
        (c) => c.category === selectedCatalogueItem.category && c.id !== selectedCatalogueItem.id
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-paper text-marine font-inter selection:bg-gold/30 selection:text-marine">
      {/* Header */}
      <Header
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        onOpenQuoteModal={() => handleOpenQuoteModal()}
      />

      {/* Main Content Router */}
      <main className="flex-1 w-full">
        {currentRoute === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onOpenQuoteModal={handleOpenQuoteModal}
            onSelectCatalogueItem={handleSelectCatalogueItem}
          />
        )}

        {currentRoute === 'about' && (
          <AboutPage
            onNavigate={navigateTo}
            onOpenQuoteModal={() => handleOpenQuoteModal()}
          />
        )}

        {currentRoute === 'activities' && (
          <ActivitiesPage
            onNavigate={navigateTo}
            onOpenQuoteModal={handleOpenQuoteModal}
          />
        )}

        {currentRoute === 'catalogue' && (
          <CataloguePage
            onSelectItem={handleSelectCatalogueItem}
            onOpenQuoteModal={handleOpenQuoteModal}
          />
        )}

        {currentRoute === 'projects' && (
          <ProjectsPage onOpenQuoteModal={handleOpenQuoteModal} />
        )}

        {currentRoute === 'contact' && <ContactPage />}

        {currentRoute === 'not-found' && <NotFoundPage onNavigate={navigateTo} />}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenLegalModal={() => setLegalModalType('legal')}
        onOpenPrivacyModal={() => setLegalModalType('privacy')}
      />

      {/* Floating WhatsApp Quick Action Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={handleQuickWhatsApp}
          className="group flex items-center gap-2.5 bg-gn-green hover:bg-gn-green-hover text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white focus:outline-none focus:ring-2 focus:ring-gn-green focus:ring-offset-2"
          aria-label="Contacter E.GUITAP via WhatsApp"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-bold tracking-wide font-poppins">
            WhatsApp E.GUITAP
          </span>
        </button>
      </div>

      {/* Modals */}
      {/* Monté uniquement à l'ouverture : l'état interne (domaine, champs) repart
          des props à chaque ouverture au lieu de garder la première valeur. */}
      {quoteModalOpen && (
        <QuoteModal
          isOpen
          onClose={() => setQuoteModalOpen(false)}
          initialDomain={quoteInitialDomain}
          initialItemRef={quoteInitialRef}
        />
      )}

      <CatalogueDetailModal
        item={selectedCatalogueItem}
        onClose={handleCloseDetailModal}
        onOpenQuote={(itm) => handleOpenQuoteModal(itm.category, itm.refCode)}
        onSelectItem={handleSelectCatalogueItem}
        relatedItems={relatedItems}
      />

      <LegalModals
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}
