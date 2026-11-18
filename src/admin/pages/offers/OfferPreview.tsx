import { ArrowRight, ArrowUpRight, Star } from 'lucide-react';
import { Badge, Card } from '../../../components/ui/Card';
import { SmartImage } from '../../../components/ui/SmartImage';
import type { MediaAsset } from '../../../content/types';
import { adminOfferImage } from './offerImage';

type PreviewProps = {
  title: string;
  slug: string;
  summary: string;
  categoryLabel: string | null;
  categorySlug: string | null;
  inDevelopment: boolean;
  featured: boolean;
  quoteEnabled: boolean;
  cover: MediaAsset | null;
};

/**
 * Aperçu fidèle de la carte du catalogue public (mêmes composants et proportions), sans liens :
 * il se met à jour pendant la saisie.
 */
export function OfferPreview(p: PreviewProps) {
  const image = adminOfferImage({ slug: p.slug, cover: p.cover, domainSlug: p.categorySlug ?? '' });
  return (
    <figure className="space-y-2">
      <figcaption className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
        Aperçu de la carte
        {p.featured && (
          <span className="inline-flex items-center gap-1 normal-case tracking-normal text-amber-700">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden="true" /> Mise en avant
          </span>
        )}
      </figcaption>
      <div className="font-inter" aria-hidden="true">
        <Card as="article" className="flex flex-col">
          <div className="relative">
            <SmartImage image={image} ratio="4/3" sizes="320px" />
            {p.categoryLabel && (
              <Badge tone="light" className="absolute left-3 top-3">
                {p.categoryLabel}
              </Badge>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-3 p-5">
            {p.inDevelopment && <Badge tone="gold">En développement</Badge>}
            <h3 className="line-clamp-2 font-poppins text-lg font-bold leading-snug text-marine">{p.title || 'Titre de l’offre'}</h3>
            {p.summary && <p className="line-clamp-3 text-sm leading-relaxed text-slate-text">{p.summary}</p>}
            <p className="pt-1 text-xs font-semibold uppercase tracking-wider text-slate-text">Sur devis</p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {p.quoteEnabled && (
                <span className="inline-flex items-center gap-2 rounded-md bg-marine px-4 py-2.5 font-poppins text-[11px] font-bold uppercase tracking-wider text-white">
                  Demander un devis <ArrowUpRight className="h-3.5 w-3.5 text-gold" />
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-marine">
                En savoir plus <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </Card>
      </div>
      {!p.summary && <p className="text-xs text-amber-800">Sans résumé, la carte n'affiche que le titre.</p>}
    </figure>
  );
}
