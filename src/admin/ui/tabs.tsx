import { useId, useRef, useState, type KeyboardEvent } from 'react';

export type TabItem = { id: string; label: string; /** Pastille d'alerte (ex. champ en erreur). */ flagged?: boolean };

/**
 * État d'un groupe d'onglets : l'onglet courant et les attributs qui relient chaque
 * panneau à son onglet. Les panneaux masqués restent dans le DOM : leurs champs
 * sont envoyés avec le formulaire.
 */
export function useTabs(initial: string) {
  const base = useId().replace(/:/g, '');
  const [current, setCurrent] = useState(initial);
  return {
    base,
    current,
    setCurrent,
    panelProps: (id: string) => ({
      role: 'tabpanel' as const,
      id: `${base}-panel-${id}`,
      'aria-labelledby': `${base}-tab-${id}`,
      hidden: id !== current,
    }),
  };
}

type TabsState = ReturnType<typeof useTabs>;

/** Barre d'onglets accessible (rôle tablist, flèches gauche / droite, Début / Fin). */
export function Tabs({ items, state, label }: { items: TabItem[]; state: TabsState; label: string }) {
  const listRef = useRef<HTMLDivElement>(null);
  const { base, current, setCurrent } = state;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = items.findIndex((t) => t.id === current);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: items.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const target = items[(next + items.length) % items.length];
    if (!target) return;
    setCurrent(target.id);
    listRef.current?.querySelector<HTMLButtonElement>(`#${CSS.escape(`${base}-tab-${target.id}`)}`)?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      className="-mx-1 flex gap-1 overflow-x-auto border-b border-slate-200 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((t) => {
        const selected = t.id === current;
        return (
          <button
            key={t.id}
            id={`${base}-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => setCurrent(t.id)}
            onKeyDown={onKeyDown}
            className={`-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-gold ${
              selected ? 'border-marine text-marine' : 'border-transparent text-slate-600 hover:text-marine'
            }`}
          >
            {t.label}
            {t.flagged && (
              <>
                <span className="h-2 w-2 rounded-full bg-red-600" aria-hidden="true" />
                <span className="sr-only">(à corriger)</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
