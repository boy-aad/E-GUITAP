import { useSearchParams } from 'react-router';
import { Chips, type ChipOption } from '../../components/ui/Navigation';
import { DEVELOPMENT_STATUS_LABELS } from '../../content/landProjects';
import type { LandProject } from '../../content/types';

const ALL = 'tous';

/** Valeurs distinctes non vides d'un champ, avec leur nombre de projets. */
function distinct(projects: LandProject[], pick: (p: LandProject) => string | null): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of projects) {
    const v = pick(p);
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return counts;
}

/**
 * Filtres simples de la liste des projets (état d'avancement publié, préfecture), affichés
 * seulement s'il existe au moins deux valeurs distinctes. État conservé dans l'URL.
 */
export function useProjectFilters(projects: LandProject[]) {
  const [params, setParams] = useSearchParams();
  const statuses = distinct(projects, (p) => p.developmentStatus);
  const prefectures = distinct(projects, (p) => p.prefecture);
  const status = params.get('statut') ?? ALL;
  const prefecture = params.get('prefecture') ?? ALL;

  const set = (key: string, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === ALL) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );

  const filtered = projects.filter(
    (p) => (status === ALL || p.developmentStatus === status) && (prefecture === ALL || p.prefecture === prefecture),
  );

  const options = (counts: Map<string, number>, label: (v: string) => string): ChipOption<string>[] => [
    { value: ALL, label: 'Tous', count: projects.length },
    ...[...counts].map(([value, count]) => ({ value, label: label(value), count })),
  ];

  const filters = (
    <>
      {statuses.size >= 2 && (
        <Chips
          label="Filtrer par état d'avancement"
          options={options(statuses, (v) => DEVELOPMENT_STATUS_LABELS[v as keyof typeof DEVELOPMENT_STATUS_LABELS] ?? v)}
          value={status}
          onChange={(v) => set('statut', v)}
        />
      )}
      {prefectures.size >= 2 && (
        <Chips label="Filtrer par préfecture" options={options(prefectures, (v) => v)} value={prefecture} onChange={(v) => set('prefecture', v)} />
      )}
    </>
  );

  const hasFilters = statuses.size >= 2 || prefectures.size >= 2;
  const reset = () => setParams(new URLSearchParams(), { replace: true, preventScrollReset: true });
  return { filtered, filters: hasFilters ? filters : null, reset };
}
