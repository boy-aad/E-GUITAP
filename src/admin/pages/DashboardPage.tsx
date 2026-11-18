import { useLoaderData } from 'react-router';
import { Briefcase, CheckCheck, Clock, FileText, Image, Inbox, LandPlot } from 'lucide-react';
import { INQUIRY_TYPE_LABELS } from '../format';
import { AdminPageHeader, BarList, Notice, SERIES_COLORS, StackedColumns, StatCard, type Series } from '../ui';
import { RecentActivity, RecentInquiries, DraftList, OffersWithoutImage, Panel } from './dashboard/Panels';
import type { DashboardData } from './dashboard/dashboardData';

export { loader } from './dashboard/dashboardData';

// Ordre fixe des séries (la couleur suit le type de demande, jamais son rang).
const SERIES: Series[] = (['demande_devis', 'renseignement_activite', 'renseignement_projet', 'contact'] as const).map((key, i) => ({
  key,
  label: INQUIRY_TYPE_LABELS[key],
  color: SERIES_COLORS[i]!,
}));

const weekShort = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const weekNumeric = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' });

/** « 5 h » sous un jour, sinon « 2,5 j ». */
function formatDelay(hours: number): string {
  if (hours < 24) return `${Math.max(1, Math.round(hours))} h`;
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(hours / 24)} j`;
}

export function Component() {
  const data = useLoaderData() as DashboardData;
  const { kpi } = data;
  const plural = (n: number, one: string, many: string) => (n > 1 ? many : one);
  const points = data.weeks.map((w) => ({
    label: weekNumeric.format(w.start),
    detail: `Semaine du ${weekShort.format(w.start)}`,
    values: w.counts,
  }));
  const totalWindow = data.weeks.reduce((sum, w) => sum + Object.values(w.counts).reduce((a, b) => a + b, 0), 0);

  return (
    <>
      <title>Tableau de bord | Administration E-GUITAP</title>
      <AdminPageHeader title="Tableau de bord" description="Vue d'ensemble du site et des demandes reçues." />

      {/* Alertes */}
      {data.unnotified > 0 && (
        <Notice tone="warning">
          {data.unnotified} {plural(data.unnotified, 'demande n’a', 'demandes n’ont')} pas fait l'objet d'une notification par e-mail
          (aucun domaine d'envoi vérifié chez Resend). Consultez-les ici régulièrement.
        </Notice>
      )}
      {(data.missingLegal.length > 0 || data.missingContacts.length > 0) && (
        <Notice tone="warning">
          Informations à compléter :
          {data.missingLegal.length > 0 && <> mentions légales ({data.missingLegal.join(', ')})</>}
          {data.missingLegal.length > 0 && data.missingContacts.length > 0 && ' ;'}
          {data.missingContacts.length > 0 && <> coordonnées publiques ({data.missingContacts.join(', ')})</>}. Les champs vides ne sont
          pas affichés sur le site.
        </Notice>
      )}

      {/* Indicateurs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Inbox className="h-5 w-5" aria-hidden="true" />} value={kpi.newInquiries} label={plural(kpi.newInquiries, 'nouvelle demande', 'nouvelles demandes')} to="/admin/demandes?statut=nouveau" />
        <StatCard icon={<FileText className="h-5 w-5" aria-hidden="true" />} value={kpi.pendingQuotes} label="devis en attente" hint="Nouveaux ou en cours" to="/admin/demandes?type=demande_devis" />
        <StatCard icon={<CheckCheck className="h-5 w-5" aria-hidden="true" />} value={kpi.treated30} label={plural(kpi.treated30, 'demande traitée', 'demandes traitées')} hint="Sur les 30 derniers jours" to="/admin/demandes?statut=traite" />
        <StatCard
          icon={<Clock className="h-5 w-5" aria-hidden="true" />}
          value={kpi.avgHandlingHours === null ? '—' : formatDelay(kpi.avgHandlingHours)}
          label="délai moyen de prise en charge"
          hint={kpi.avgHandlingHours === null ? 'Aucune demande prise en charge sur 90 jours' : 'De la réception au premier changement de statut, 90 jours'}
        />
        <StatCard icon={<Briefcase className="h-5 w-5" aria-hidden="true" />} value={`${kpi.offers.published} / ${kpi.offers.total}`} label="offres publiées" to="/admin/offres" />
        <StatCard icon={<LandPlot className="h-5 w-5" aria-hidden="true" />} value={`${kpi.projects.published} / ${kpi.projects.total}`} label="projets fonciers publiés" to="/admin/projets" />
        <StatCard icon={<Image className="h-5 w-5" aria-hidden="true" />} value={kpi.media} label={plural(kpi.media, 'média dans la médiathèque', 'médias dans la médiathèque')} />
      </div>

      {/* Graphiques */}
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel title="Demandes par semaine">
            <div className="p-5">
              <p className="mb-4 text-sm text-slate-600">
                {totalWindow} demande{totalWindow > 1 ? 's' : ''} sur les 12 dernières semaines, par type.
              </p>
              <StackedColumns series={SERIES} points={points} caption="Demandes reçues par semaine et par type, sur 12 semaines" />
            </div>
          </Panel>
        </div>
        <Panel title="Demandes par catégorie">
          <div className="p-5">
            <p className="mb-4 text-sm text-slate-600">Sur les 12 dernières semaines.</p>
            {data.byCategory.length ? (
              <BarList items={data.byCategory} caption="Demandes par catégorie d'offre" />
            ) : (
              <p className="text-sm text-slate-600">Aucune demande sur la période.</p>
            )}
          </div>
        </Panel>
      </div>

      {/* Listes */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Dernières demandes" link={{ to: '/admin/demandes', label: 'Tout voir' }}>
          <RecentInquiries items={data.recent} />
        </Panel>
        <Panel title="Brouillons à finaliser">
          <DraftList items={data.drafts} />
        </Panel>
        <Panel title="Offres sans image réelle" link={{ to: '/admin/offres', label: 'Catalogue' }}>
          <OffersWithoutImage items={data.offersWithoutImage} />
        </Panel>
        {data.isAdmin && (
          <Panel title="Activité récente">
            <RecentActivity items={data.activity} />
          </Panel>
        )}
      </div>
    </>
  );
}
