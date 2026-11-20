import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';

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
  // Indicateur glissant : position et largeur de l'onglet courant, suivies au redimensionnement.
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    const tab = document.getElementById(`${base}-tab-${current}`);
    if (!list || !tab) return;
    const measure = () => setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth });
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    observer.observe(tab);
    return () => observer.disconnect();
  }, [base, current]);

  // Barre défilante sur mobile : l'onglet courant reste visible (y compris ouvert par programme).
  useEffect(() => {
    document.getElementById(`${base}-tab-${current}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [base, current]);

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
      className="relative -mx-1 flex gap-1 overflow-x-auto border-b border-slate-200 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
            className={`press inline-flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold ${
              selected ? 'text-marine' : 'text-slate-600 hover:text-marine'
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
      <span
        aria-hidden="true"
        className="tab-indicator pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-marine"
        style={indicator ? { translate: `${indicator.left}px 0`, width: indicator.width } : { opacity: 0 }}
      />
    </div>
  );
}
