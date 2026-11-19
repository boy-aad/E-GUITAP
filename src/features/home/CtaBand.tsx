import { ArrowUpRight, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Container } from '../../components/ui/Section';
import { Reveal } from '../../components/ui/Reveal';
import { SmartImage } from '../../components/ui/SmartImage';
import { stockImage } from '../../content/stockPhotos';
import { useSiteContent } from '../../data/useSiteContent';
import { DEFAULT_WHATSAPP_MESSAGE, whatsappUrl } from '../../lib/contact';
import { useInquiry } from '../inquiry/InquiryContext';

/** Bandeau d'appel à l'action de l'accueil, sur photo voilée de marine. */
export function CtaBand() {
  const { contacts, blocks } = useSiteContent();
  const { openInquiry } = useInquiry();
  const cta = blocks['home.cta'];

  return (
    <section className="relative isolate overflow-hidden bg-marine py-12 text-white lg:py-16">
      <SmartImage
        image={{ ...stockImage('ctaDevis'), alt: '' }}
        ratio="auto"
        sizes="100vw"
        className="absolute! inset-0 -z-10"
      />
      <div className="absolute inset-0 -z-10 bg-marine-dark/80" aria-hidden="true" />
      <Container>
        <Reveal variant="zoom" className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {cta?.title ?? 'Un projet, une question ?'}
          </h2>
          {cta?.body && <p className="text-lg leading-relaxed text-white/85">{cta.body}</p>}
          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <Button size="lg" onClick={() => openInquiry()} iconRight={<ArrowUpRight className="h-4 w-4" aria-hidden="true" />}>
              Demande de renseignements
            </Button>
            {contacts.whatsapp && (
              <Button
                size="lg"
                variant="whatsapp"
                href={whatsappUrl(contacts.whatsapp.raw, DEFAULT_WHATSAPP_MESSAGE)}
                icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
              >
                WhatsApp
              </Button>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
