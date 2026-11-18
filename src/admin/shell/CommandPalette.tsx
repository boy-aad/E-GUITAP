import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Briefcase, Inbox, LandPlot, Loader2, Search, type LucideIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Result = { id: string; group: string; icon: LucideIcon; label: string; detail?: string; to: string };

/** Caractères réservés de la syntaxe des filtres PostgREST, retirés de la saisie. */
const clean = (q: string) => q.replace(/[%,()*\\]/g, ' ').trim();

async function search(q: string, signal: AbortSignal): Promise<Result[]> {
  const like = `%${q}%`;
  const [offers, projects, inquiries] = await Promise.all([
    supabase.from('activity_services').select('id, title').ilike('title', like).limit(5).abortSignal(signal),
    supabase.from('land_projects').select('id, name, prefecture').ilike('name', like).limit(5).abortSignal(signal),
    supabase
      .from('inquiries')
      .select('id, full_name, phone, subject')
      .or(`full_name.ilike.${like},phone.ilike.${like},email.ilike.${like}`)
      .order('created_at', { ascending: false })
      .limit(6)
      .abortSignal(signal),
  ]);
  return [
    ...(offers.data ?? []).map((o) => ({ id: `o-${o.id}`, group: 'Offres', icon: Briefcase, label: o.title, to: `/admin/offres/${o.id}` })),
    ...(projects.data ?? []).map((p) => ({
      id: `p-${p.id}`,
      group: 'Projets fonciers',
      icon: LandPlot,
      label: p.name,
      detail: p.prefecture ?? undefined,
      to: `/admin/projets/${p.id}`,
    })),
    ...(inquiries.data ?? []).map((i) => ({
      id: `i-${i.id}`,
      group: 'Demandes',
      icon: Inbox,
      label: i.full_name,
      detail: [i.phone, i.subject].filter(Boolean).join(' · '),
      to: `/admin/demandes/${i.id}`,
    })),
  ];
}

/**
 * Recherche globale (Ctrl/⌘ + K) : offres, projets, demandes (nom, téléphone, e-mail).
 * Flèches haut/bas pour choisir, Entrée pour ouvrir, Échap pour fermer.
 */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  const q = clean(query);
  useEffect(() => {
    if (q.length < 2) return;
    const controller = new AbortController();
    const id = window.setTimeout(() => {
      setLoading(true);
      search(q, controller.signal)
        .then((r) => {
          setResults(r);
          setActive(0);
        })
        .catch(() => {
          // Recherche annulée (nouvelle saisie) ou réseau indisponible : résultats inchangés.
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      window.clearTimeout(id);
      controller.abort();
    };
  }, [q]);

  const shown = q.length >= 2 ? results : [];
  const go = (r: Result | undefined) => {
    if (!r) return;
    onClose();
    setQuery('');
    navigate(r.to);
  };

  return (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- clic sur le fond ; Échap ferme au clavier.
    <dialog
      ref={ref}
      aria-label="Recherche dans l'administration"
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-xl rounded-xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50"
    >
      <div className="flex items-center gap-3 border-b border-slate-200 px-4">
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden="true" /> : <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />}
        <input
          // oxlint-disable-next-line jsx-a11y/no-autofocus -- la fenêtre n'existe que pour cette saisie.
          autoFocus
          role="combobox"
          aria-expanded={shown.length > 0}
          aria-controls={listId}
          aria-activedescendant={shown[active] ? `${listId}-${shown[active].id}` : undefined}
          aria-label="Rechercher une offre, un projet ou une demande"
          placeholder="Offre, projet, nom ou téléphone d'un demandeur…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, shown.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              go(shown[active]);
            }
          }}
          className="h-14 flex-1 bg-transparent text-sm outline-none"
        />
        <kbd className="rounded border border-slate-200 px-1.5 text-[11px] text-slate-500">Échap</kbd>
      </div>
      <div id={listId} role="listbox" aria-label="Résultats" className="max-h-80 overflow-y-auto p-2">
        {q.length < 2 && <p className="px-3 py-6 text-center text-sm text-slate-500">Saisissez au moins deux caractères.</p>}
        {q.length >= 2 && !loading && shown.length === 0 && <p className="px-3 py-6 text-center text-sm text-slate-500">Aucun résultat.</p>}
        {shown.map((r, i) => {
          const Icon = r.icon;
          const showGroup = i === 0 || shown[i - 1]?.group !== r.group;
          return (
            <div key={r.id} role="presentation">
              {showGroup && <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{r.group}</p>}
              <div
                id={`${listId}-${r.id}`}
                role="option"
                aria-selected={i === active}
                tabIndex={-1}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r)}
                onKeyDown={(e) => e.key === 'Enter' && go(r)}
                className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm ${i === active ? 'bg-marine text-white' : 'text-slate-800'}`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${i === active ? 'text-gold' : 'text-slate-400'}`} aria-hidden="true" />
                <span className="truncate font-semibold">{r.label}</span>
                {r.detail && <span className={`truncate text-xs ${i === active ? 'text-white/70' : 'text-slate-500'}`}>{r.detail}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </dialog>
  );
}
