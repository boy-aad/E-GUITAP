import { createContext, lazy, Suspense, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Modal } from '../../components/ui/Modal';
import { isQuoteTopic, type InquiryTopic } from './topics';

// Formulaire (et Turnstile) téléchargés à la première ouverture de la modale seulement.
const InquiryForm = lazy(() => import('./InquiryForm').then((m) => ({ default: m.InquiryForm })));

type InquiryContextValue = {
  /** Ouvre la demande de renseignements, avec un sujet présélectionné. */
  openInquiry: (topic?: InquiryTopic) => void;
};

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [topic, setTopic] = useState<InquiryTopic | null>(null);

  const openInquiry = useCallback((t: InquiryTopic = 'general') => setTopic(t), []);
  const value = useMemo(() => ({ openInquiry }), [openInquiry]);

  return (
    <InquiryContext.Provider value={value}>
      {children}
      <Modal
        open={topic !== null}
        onClose={() => setTopic(null)}
        eyebrow="Contact E-GUITAP"
        title={topic !== null && isQuoteTopic(topic) ? 'Demande de devis' : 'Demande de renseignements'}
      >
        {/* La clé remonte le formulaire à chaque ouverture : le sujet suit le bouton cliqué. */}
        {topic !== null && (
          <Suspense fallback={<p className="py-10 text-center text-sm text-slate-text">Chargement du formulaire…</p>}>
            <InquiryForm key={topic} initialTopic={topic} />
          </Suspense>
        )}
      </Modal>
    </InquiryContext.Provider>
  );
}

export function useInquiry() {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error('useInquiry doit être utilisé dans <InquiryProvider>.');
  return ctx;
}
