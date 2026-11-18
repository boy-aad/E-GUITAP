import { redirect, useLoaderData } from 'react-router';
import { CATEGORY_ILLUSTRATIONS, OFFER_ILLUSTRATIONS } from '../../content/offerIllustrations';
import { requireStaff } from '../auth';
import { AdminPageHeader, Badge, cardClass } from '../ui';

// Planche de contrôle des illustrations générées (PRD § 5.3) : toutes côte à côte pour
// juger de leur cohérence. Page d'outil, déclarée uniquement en développement
// (voir routes.tsx) et réservée aux administrateurs.

/** Poids maximal d'une illustration (PRD § 5.3). */
const MAX_BYTES = 15 * 1024;

/** Projets fonciers illustrés (voir src/content/projectImages.ts). */
const PROJECT_ILLUSTRATIONS = ['amaria-ouassou', 'site-de-forecariah', 'bady'];

type Item = { group: string; slug: string; src: string; bytes: number | null };

export const handle = { crumb: 'Illustrations' };

export async function loader({ request }: { request: Request }) {
  const session = await requireStaff(request);
  if (session.staff.role !== 'admin') throw redirect('/admin');

  const entries: Omit<Item, 'bytes'>[] = [
    ...[...OFFER_ILLUSTRATIONS].map((slug) => ({ group: 'Offres', slug, src: `/assets/illustrations/offres/${slug}.svg` })),
    ...[...CATEGORY_ILLUSTRATIONS].map((slug) => ({ group: 'Catégories', slug, src: `/assets/illustrations/categories/${slug}.svg` })),
    { group: 'Générique', slug: 'defaut', src: '/assets/illustrations/defaut.svg' },
    ...PROJECT_ILLUSTRATIONS.map((slug) => ({ group: 'Projets fonciers', slug, src: `/assets/illustrations/projets/${slug}.svg` })),
  ];
  // Poids réel de chaque fichier, pour repérer ceux qui dépassent la limite.
  return Promise.all(
    entries.map(async (e): Promise<Item> => {
      try {
        const res = await fetch(e.src, { signal: request.signal });
        return { ...e, bytes: res.ok ? (await res.blob()).size : null };
      } catch {
        return { ...e, bytes: null };
      }
    }),
  );
}

export function Component() {
  const items = useLoaderData() as Item[];
  const groups = [...new Set(items.map((i) => i.group))];
  const tooHeavy = items.filter((i) => i.bytes !== null && i.bytes > MAX_BYTES).length;
  const missing = items.filter((i) => i.bytes === null).length;

  return (
    <>
      <title>Illustrations | Administration E-GUITAP</title>
      <AdminPageHeader
        title="Planche des illustrations"
        description={`${items.length} illustrations générées, affichées au format des cartes (4:3). Limite : ${MAX_BYTES / 1024} Ko par fichier.`}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge tone={tooHeavy ? 'danger' : 'success'}>{tooHeavy ? `${tooHeavy} au-dessus de la limite` : 'Toutes sous la limite'}</Badge>
        {missing > 0 && <Badge tone="danger">{missing} introuvable{missing > 1 ? 's' : ''}</Badge>}
      </div>

      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group} aria-labelledby={`groupe-${group}`}>
            <h2 id={`groupe-${group}`} className="mb-4 font-poppins text-lg font-bold text-marine">
              {group}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items
                .filter((i) => i.group === group)
                .map((item) => (
                  <li key={item.src} className={`${cardClass} overflow-hidden`}>
                    <img src={item.src} alt="" width={800} height={600} loading="lazy" className="aspect-[4/3] w-full bg-ivory object-cover" />
                    <div className="flex items-center justify-between gap-3 p-3 text-xs">
                      <code className="truncate text-marine" title={item.slug}>
                        {item.slug}
                      </code>
                      {item.bytes === null ? (
                        <Badge tone="danger">introuvable</Badge>
                      ) : (
                        <Badge tone={item.bytes > MAX_BYTES ? 'danger' : 'neutral'}>{(item.bytes / 1024).toFixed(1)} Ko</Badge>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
