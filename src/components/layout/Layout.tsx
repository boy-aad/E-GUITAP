import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { MessageSquare } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { InquiryProvider } from '../../features/inquiry/InquiryContext';
import { DEFAULT_WHATSAPP_MESSAGE, whatsappUrl } from '../../lib/contact';
import { useSiteContent } from '../../data/useSiteContent';

/** Fait défiler jusqu'à l'ancre (#btp…) quand l'URL en contient une. */
function useScrollToHash() {
  // location.key change à chaque navigation, même vers la même ancre.
  const { hash, key } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // oxlint-disable-next-line react/exhaustive-deps -- `key` est voulu : relancer à chaque navigation.
  }, [hash, key]);
}

export function Layout() {
  const { contacts } = useSiteContent();
  useScrollToHash();
  return (
    <InquiryProvider>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-marine focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu
      </a>
      <div className="flex min-h-screen flex-col bg-paper font-inter text-marine">
        <Header />
        <main id="contenu" className="w-full flex-1 scroll-mt-24">
          <Outlet />
        </main>
        <Footer />
      </div>

      {contacts.whatsapp && (
        <a
          href={whatsappUrl(contacts.whatsapp.raw, DEFAULT_WHATSAPP_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 rounded-full border-2 border-white bg-gn-green p-3 text-white shadow-lg transition-all hover:bg-gn-green-hover hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gn-green sm:px-4"
          aria-label="Écrire à E-GUITAP sur WhatsApp"
        >
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
          <span className="hidden font-poppins text-xs font-bold tracking-wide sm:inline">WhatsApp</span>
        </a>
      )}

      {/* Au premier chargement, toutes les URL ont la clé « default » : on utilise alors le
          chemin, pour ne pas réappliquer la position de défilement d'une autre page. */}
      <ScrollRestoration getKey={(location) => (location.key === 'default' ? location.pathname : location.key)} />
    </InquiryProvider>
  );
}
