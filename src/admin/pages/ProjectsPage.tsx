import { Link, useLoaderData, useSearchParams } from 'react-router';
import { ExternalLink, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { COMMERCIAL_STATUS_LABELS, DEVELOPMENT_STATUS_LABELS, formatHectares } from '../../content/landProjects';
import { DOCUMENT_STATUS_LABELS, PUBLICATION_LABELS } from '../format';
import { AdminPageHeader, Badge, Notice, cardClass, primaryButton } from '../ui';

export async function loader() {
  const { data, error } = await supabase
    .from('land_projects')
    .select('id, slug, name, prefecture, area_ha, publication, development_status, commercial_status, document_status, sort_order')
    .order('sort_order')
    .order('name');
  if (error) throw new Error(error.message);
  return data;
}

export function Component() {
  const projects = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const [params] = useSearchParams();

  return (
    <>
      <title>Projets fonciers | Administration E-GUITAP</title>
      <AdminPageHeader
        title="Projets fonciers"
        description="Les projets publiés apparaissent sur le site, dans l'ordre indiqué."
        actions={
          <Link to="/admin/projets/nouveau" className={primaryButton}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nouveau projet
          </Link>
        }
      />
      {params.get('supprime') && <Notice tone="success">Le projet a été supprimé.</Notice>}

      <div className={`${cardClass} overflow-x-auto`}>
        {projects.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-text">Aucun projet pour le moment.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-paper text-xs uppercase tracking-wider text-slate-text">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Ordre</th>
                <th scope="col" className="px-4 py-3 font-semibold">Projet</th>
                <th scope="col" className="px-4 py-3 font-semibold">Superficie</th>
                <th scope="col" className="px-4 py-3 font-semibold">Avancement</th>
                <th scope="col" className="px-4 py-3 font-semibold">Commercialisation</th>
                <th scope="col" className="px-4 py-3 font-semibold">Documents</th>
                <th scope="col" className="px-4 py-3 font-semibold">Publication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-paper">
                  <td className="px-4 py-3 text-slate-text">{p.sort_order}</td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/projets/${p.id}`} className="font-semibold text-marine hover:underline">
                      {p.name}
                    </Link>
                    {p.publication === 'publie' && (
                      <a
                        href={`/projets/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex text-slate-text hover:text-marine"
                        title="Voir sur le site"
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Voir {p.name} sur le site</span>
                      </a>
                    )}
                    {p.prefecture && <span className="block text-xs text-slate-text">{p.prefecture}</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{formatHectares(Number(p.area_ha))}</td>
                  <td className="px-4 py-3 text-xs">{p.development_status ? DEVELOPMENT_STATUS_LABELS[p.development_status] : '—'}</td>
                  <td className="px-4 py-3 text-xs">{p.commercial_status ? COMMERCIAL_STATUS_LABELS[p.commercial_status] : '—'}</td>
                  <td className="px-4 py-3 text-xs">{DOCUMENT_STATUS_LABELS[p.document_status]}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.publication === 'publie' ? 'success' : p.publication === 'brouillon' ? 'warning' : 'neutral'}>
                      {PUBLICATION_LABELS[p.publication]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
