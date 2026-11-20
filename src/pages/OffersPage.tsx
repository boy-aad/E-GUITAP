import { useSearchParams } from 'react-router';
import { SearchX } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import { Container } from '../components/ui/Section';
import { Reveal } from '../components/ui/Reveal';
import { Button } from '../components/ui/Button';
import { Chips, EmptyState, SearchInput } from '../components/ui/Navigation';
import { stockImage } from '../content/stockPhotos';
import type { AvailabilityStatus } from '../content/types';
import { useSiteContent } from '../data/useSiteContent';
import { OfferCard } from '../features/offers/OfferCard';
import { filterOffers } from '../features/offers/filterOffers';

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus | ''; label: string }[] = [
  { value: '', label: 'Toutes' },
  { value: 'operationnelle', label: 'Opérationnelles' },
  { value: 'en_developpement', label: 'En développement' },
];

export function OffersPage() {
  const { offers, domains } = useSiteContent();
  // État des filtres dans l'URL (?categorie=btp&q=route&dispo=…) : partage et retour arrière.
  const [params, setParams] = useSearchParams();
  const category = domains.some((d) => d.slug === params.get('categorie')) ? (params.get('categorie') ?? '') : '';
  const query = params.get('q') ?? '';
  const dispoParam = params.get('dispo');
  const availability = AVAILABILITY_OPTIONS.some((o) => o.value && o.value === dispoParam) ? (dispoParam as AvailabilityStatus) : '';

  const update = (key: string, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: key === 'q', preventScrollReset: true },
    );

  const visible = filterOffers(offers, { category, query, availability });
  const hasDevelopment = offers.some((o) => o.availability === 'en_developpement');
  const categoryOptions = [
    { value: '', label: 'Toutes', count: offers.length },
    ...domains.map((d) => ({ value: d.slug, label: d.shortTitle, count: offers.filter((o) => o.domainSlug === d.slug).length })),
  ];

  return (
    <>
      <Seo
        title="Nos offres"
        description="Le catalogue des offres d'E-GUITAP : BTP, immobilier et aménagement foncier, commerce général, import-export. Demandez un devis en ligne."
      />
      <PageHero eyebrow="Catalogue" title="Nos offres" crumbs={[{ label: 'Nos offres' }]} image={stockImage('pageOffres')}>
        <p>
          Toutes nos prestations, par domaine d'activité. Chaque offre est établie sur devis, selon votre projet :
          décrivez votre besoin, nous vous répondons.
        </p>
      </PageHero>

      <div className="z-20 material-bar-paper border-b border-slate-200 lg:sticky lg:top-[86px]">
        <Container className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 overflow-x-auto px-1 pb-1 lg:pb-0">
            <Chips nowrap label="Catégories" options={categoryOptions} value={category} onChange={(v) => update('categorie', v)} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {hasDevelopment && (
              <Chips label="Disponibilité" options={AVAILABILITY_OPTIONS} value={availability} onChange={(v) => update('dispo', v)} />
            )}
            <SearchInput
              value={query}
              onChange={(v) => update('q', v)}
              label="Rechercher une offre"
              placeholder="Rechercher une offre…"
              className="sm:w-72"
            />
          </div>
        </Container>
      </div>

      <section aria-labelledby="liste-offres" className="bg-paper py-12 lg:py-16">
        <Container>
          {/* Titre de niveau 2 pour une hiérarchie continue (h1 → h2 → titres des cartes en h3). */}
          <h2 id="liste-offres" className="sr-only">
            Liste des offres
          </h2>
          <p className="mb-6 text-sm text-slate-text" aria-live="polite">
            {visible.length} offre{visible.length > 1 ? 's' : ''}
          </p>
          {visible.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {visible.map((offer, i) => (
                <Reveal key={offer.slug} delay={(i % 3) * 70} className="h-full">
                  <OfferCard offer={offer} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<SearchX className="h-5 w-5" aria-hidden="true" />}
              title="Aucune offre ne correspond à votre recherche"
              action={
                <Button variant="secondary" size="sm" onClick={() => setParams(new URLSearchParams(), { preventScrollReset: true })}>
                  Réinitialiser les filtres
                </Button>
              }
            >
              Essayez un autre mot-clé ou une autre catégorie.
            </EmptyState>
          )}
        </Container>
      </section>
    </>
  );
}
