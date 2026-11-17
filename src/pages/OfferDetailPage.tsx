import { useParams } from 'react-router';
import { ArrowUpRight, MessageSquare, Phone } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import { Container } from '../components/ui/Section';
import { Badge, Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SmartImage } from '../components/ui/SmartImage';
import { Reveal } from '../components/ui/Reveal';
import { useSiteContent } from '../data/useSiteContent';
import { OfferCard } from '../features/offers/OfferCard';
import { resolveOfferImage } from '../features/offers/offerImage';
import { useInquiry } from '../features/inquiry/InquiryContext';
import { DEFAULT_WHATSAPP_MESSAGE, telUrl, whatsappUrl } from '../lib/contact';
import { NotFoundPage } from './NotFoundPage';

export function OfferDetailPage() {
  const { slug } = useParams();
  const { offers, domains, contacts } = useSiteContent();
  const { openInquiry } = useInquiry();
  const offer = offers.find((o) => o.slug === slug);
  if (!offer) return <NotFoundPage />;

  const category = domains.find((d) => d.slug === offer.domainSlug);
  const related = offers.filter((o) => o.domainSlug === offer.domainSlug && o.slug !== offer.slug).slice(0, 3);
  const image = resolveOfferImage(offer);
  const paragraphs = (offer.description ?? offer.summary ?? '').split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <Seo title={offer.title} description={offer.summary ?? `${offer.title} — offre E-GUITAP, sur devis.`} />
      <PageHero
        eyebrow={category?.title ?? 'Nos offres'}
        title={offer.title}
        crumbs={[
          { label: 'Nos offres', to: '/offres' },
          ...(category ? [{ label: category.shortTitle, to: `/offres?categorie=${category.slug}` }] : []),
          { label: offer.title },
        ]}
      />

      <Container className="py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <SmartImage image={image} ratio="16/9" priority sizes="(min-width: 1024px) 66vw, 100vw" className="rounded-xl" />
            <div className="flex flex-wrap gap-2">
              {category && <Badge tone="marine">{category.title}</Badge>}
              {offer.availability === 'en_developpement' && <Badge tone="gold">En développement</Badge>}
              <Badge tone="neutral">Sur devis</Badge>
            </div>
            {paragraphs.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-poppins text-2xl font-bold tracking-tight text-marine">Présentation</h2>
                {paragraphs.map((p) => (
                  <p key={p} className="text-base leading-relaxed text-slate-text sm:text-lg">
                    {p}
                  </p>
                ))}
              </section>
            )}
          </div>

          <aside className="self-start lg:sticky lg:top-28">
            <Card className="space-y-5 p-7">
              <h2 className="font-poppins text-lg font-bold text-marine">Votre projet</h2>
              <p className="text-sm leading-relaxed text-slate-text">
                Décrivez-nous votre besoin : nous vous répondons avec un devis adapté.
              </p>
              {offer.quoteEnabled && (
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => openInquiry(`offer:${offer.slug}`)}
                  iconRight={<ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
                >
                  Demander un devis
                </Button>
              )}
              {contacts.whatsapp && (
                <Button
                  fullWidth
                  variant="whatsapp"
                  href={whatsappUrl(contacts.whatsapp.raw, `${DEFAULT_WHATSAPP_MESSAGE} Offre : ${offer.title}.`)}
                  icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
                >
                  WhatsApp
                </Button>
              )}
              {contacts.phone && (
                <Button fullWidth variant="secondary" href={telUrl(contacts.phone.raw)} icon={<Phone className="h-4 w-4" aria-hidden="true" />}>
                  {contacts.phone.value}
                </Button>
              )}
            </Card>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-20 space-y-8 border-t border-slate-200 pt-14">
            <h2 className="font-poppins text-2xl font-bold tracking-tight text-marine sm:text-3xl">
              Autres offres {category ? `— ${category.shortTitle}` : ''}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((o, i) => (
                <Reveal key={o.slug} delay={i * 80} className="h-full">
                  <OfferCard offer={o} compact />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
