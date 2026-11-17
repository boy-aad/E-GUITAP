import { Link, useLoaderData, useSearchParams } from 'react-router';
import { ExternalLink, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AVAILABILITY_LABELS, PUBLICATION_LABELS } from '../format';
import { AdminPageHeader, Badge, Notice, cardClass } from '../ui';

export async function loader() {
  const { data, error } = await supabase
    .from('activity_services')
    .select('id, slug, title, summary, availability, publication, is_featured, sort_order, activity_domains (title, short_title, sort_order)')
    .order('sort_order');
  if (error) throw new Error(error.message);
  // Par catégorie (ordre des domaines), puis ordre de l'offre.
  return [...data].sort(
    (a, b) => (a.activity_domains?.sort_order ?? 0) - (b.activity_domains?.sort_order ?? 0) || a.sort_order - b.sort_order,
  );
}

export function Component() {
  const offers = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const [params] = useSearchParams();

  return (
    <>
      <title>Offres | Administration E-GUITAP</title>
      <AdminPageHeader
        title="Offres"
        description="Le catalogue du site (page « Nos offres »). Cliquez sur une offre pour modifier son résumé, sa description ou sa publication."
      />
      {params.get('enregistre') && <Notice tone="success">L'offre a été enregistrée.</Notice>}

      <div className={`${cardClass} overflow-x-auto`}>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-paper text-xs uppercase tracking-wider text-slate-text">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Offre</th>
              <th scope="col" className="px-4 py-3 font-semibold">Catégorie</th>
              <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Résumé</th>
              <th scope="col" className="px-4 py-3 font-semibold">Disponibilité</th>
              <th scope="col" className="px-4 py-3 font-semibold">Publication</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {offers.map((o) => (
              <tr key={o.id} className="hover:bg-paper">
                <td className="px-4 py-3">
                  <Link to={`/admin/offres/${o.id}`} className="font-semibold text-marine hover:underline">
                    {o.title}
                  </Link>
                  {o.is_featured && <Star className="ml-1.5 inline h-3.5 w-3.5 fill-gold text-gold" aria-label="Mise en avant" />}
                  {o.publication === 'publie' && (
                    <a
                      href={`/offres/${o.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex text-slate-text hover:text-marine"
                      aria-label={`Voir « ${o.title} » sur le site (nouvel onglet)`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-text">{o.activity_domains?.short_title ?? '—'}</td>
                <td className="hidden max-w-sm px-4 py-3 text-slate-text md:table-cell">
                  {o.summary ? <span className="line-clamp-2">{o.summary}</span> : <Badge tone="warning">À compléter</Badge>}
                </td>
                <td className="px-4 py-3 text-slate-text">{AVAILABILITY_LABELS[o.availability]}</td>
                <td className="px-4 py-3">
                  <Badge tone={o.publication === 'publie' ? 'success' : o.publication === 'brouillon' ? 'warning' : 'neutral'}>
                    {PUBLICATION_LABELS[o.publication]}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
