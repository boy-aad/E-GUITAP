import { useEffect, useState, type ReactNode } from 'react';
import { useBlocker } from 'react-router';
import { Loader2, Save } from 'lucide-react';
import { primaryButton, secondaryButton } from './basics';
import { useConfirm } from './dialogs';

/**
 * Suivi des modifications non enregistrées d'un formulaire : à brancher sur `onChange`
 * du <Form>. Bloque la navigation interne (useBlocker) et la fermeture de l'onglet
 * tant que les changements ne sont pas enregistrés.
 */
export function useUnsavedChanges(submitting: boolean) {
  const [dirty, setDirty] = useState(false);
  const confirm = useConfirm();
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !submitting && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    void confirm({
      title: 'Quitter sans enregistrer ?',
      message: 'Les modifications de ce formulaire seront perdues.',
      confirmLabel: 'Quitter la page',
      cancelLabel: 'Rester',
      danger: true,
    }).then((ok) => (ok ? blocker.proceed() : blocker.reset()));
  }, [blocker, confirm]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  return { dirty, markDirty: () => setDirty(true), reset: () => setDirty(false) };
}

/**
 * Barre d'actions collée en bas de l'écran : état des modifications + Annuler / Enregistrer.
 * Le bouton « Enregistrer » soumet le formulaire englobant.
 */
export function StickyActionBar({
  dirty,
  saving,
  onCancel,
  extra,
  saveLabel = 'Enregistrer',
}: {
  dirty: boolean;
  saving: boolean;
  onCancel?: () => void;
  extra?: ReactNode;
  saveLabel?: string;
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 material-bar border-t border-slate-200 px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600" aria-live="polite">
          {saving ? 'Enregistrement en cours…' : dirty ? (
            <span className="inline-flex items-center gap-2 font-semibold text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
              Modifications non enregistrées
            </span>
          ) : (
            'Aucune modification en attente'
          )}
        </p>
        {/* Mobile : boutons sur toute la largeur, renvoyés à la ligne si besoin (aucun débordement). */}
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
          {extra}
          {onCancel && (
            <button type="button" className={secondaryButton} onClick={onCancel} disabled={!dirty || saving}>
              Annuler
            </button>
          )}
          <button type="submit" name="intent" value="save" className={primaryButton} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
