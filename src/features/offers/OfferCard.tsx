import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Badge, Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SmartImage } from '../../components/ui/SmartImage';
import type { Offer } from '../../content/types';
import { useSiteContent } from '../../data/useSiteContent';
import { useInquiry } from '../inquiry/InquiryContext';
import { resolveOfferImage } from './offerImage';

/** Carte d'offre : image 4:3, catégorie, titre, résumé, « Demander un devis » et lien vers la fiche. */
export function OfferCard({ offer, compact }: { offer: Offer; compact?: boolean }) {
  const { domains } = useSiteContent();
  const { openInquiry } = useInquiry();
  const category = domains.find((d) => d.slug === offer.domainSlug);
  const href = `/offres/${offer.slug}`;

  return (
    <Card as="article" interactive className="flex h-full flex-col">
      <div className="relative">
        <SmartImage
          image={resolveOfferImage(offer)}
          ratio="4/3"
          sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          imgClassName="transition-transform duration-700 ease-spring motion-safe:group-hover:scale-105"
        />
        {category && (
          <Badge tone="light" className="absolute left-3 top-3">
            {category.shortTitle}
          </Badge>
        )}
      </div>
      <div className={`flex flex-1 flex-col gap-3 ${compact ? 'p-5' : 'p-6'}`}>
        {offer.availability === 'en_developpement' && <Badge tone="gold">En développement</Badge>}
        <h3 className="line-clamp-2 font-poppins text-lg font-bold leading-snug text-marine">
          <Link to={href} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
            {offer.title}
          </Link>
        </h3>
        {offer.summary && <p className="line-clamp-3 text-sm leading-relaxed text-slate-text">{offer.summary}</p>}
        <p className="mt-auto pt-1 text-xs font-semibold uppercase tracking-wider text-slate-text">Sur devis</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {offer.quoteEnabled && (
            <Button
              size="sm"
              variant="dark"
              onClick={() => openInquiry(`offer:${offer.slug}`)}
              iconRight={<ArrowUpRight className="h-3.5 w-3.5 text-gold" aria-hidden="true" />}
            >
              Demander un devis
              <span className="sr-only"> — {offer.title}</span>
            </Button>
          )}
          <Link
            to={href}
            className="link-underline inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-marine hover:text-gold-hover"
          >
            En savoir plus
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only"> — {offer.title}</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
