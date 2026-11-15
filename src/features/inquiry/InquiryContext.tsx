import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Modal } from '../../components/ui/Modal';
import { InquiryForm } from './InquiryForm';
import type { InquiryTopic } from './topics';

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
        title="Demande de renseignements"
      >
        {/* La clé remonte le formulaire à chaque ouverture : le sujet suit le bouton cliqué. */}
        {topic !== null && <InquiryForm key={topic} initialTopic={topic} />}
      </Modal>
    </InquiryContext.Provider>
  );
}

export function useInquiry() {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error('useInquiry doit être utilisé dans <InquiryProvider>.');
  return ctx;
}
