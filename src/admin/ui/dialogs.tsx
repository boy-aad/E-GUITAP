import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { dangerSolidButton, primaryButton, secondaryButton } from './basics';

export type ConfirmOptions = {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Action destructive (bouton rouge). */
  danger?: boolean;
};

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

/**
 * Boîte de confirmation accessible (<dialog> modal : focus piégé, Échap = annuler).
 * Remplace window.confirm dans toute l'administration.
 */
function ConfirmDialog({ pending, onClose }: { pending: Pending | null; onClose: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (pending && !dialog.open) {
      dialog.showModal();
      // Focus sur « Annuler » : une validation par Entrée ne déclenche jamais l'action destructive.
      cancelRef.current?.focus();
    } else if (!pending && dialog.open) dialog.close();
  }, [pending]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose(false);
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50"
    >
      {pending && (
        <div className="p-6">
          <div className="flex gap-4">
            {pending.danger && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
            )}
            <div className="space-y-2">
              <h2 id={titleId} className="font-poppins text-lg font-bold text-marine">
                {pending.title}
              </h2>
              {pending.message && <div className="text-sm text-slate-600">{pending.message}</div>}
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button ref={cancelRef} type="button" className={secondaryButton} onClick={() => onClose(false)}>
              {pending.cancelLabel ?? 'Annuler'}
            </button>
            <button type="button" className={pending.danger ? dangerSolidButton : primaryButton} onClick={() => onClose(true)}>
              {pending.confirmLabel ?? 'Confirmer'}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  );
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        pending={pending}
        onClose={(ok) => {
          pending?.resolve(ok);
          setPending(null);
        }}
      />
    </ConfirmContext.Provider>
  );
}

/** `const confirm = useConfirm(); if (await confirm({ title: '…', danger: true })) …` */
export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm doit être utilisé sous ConfirmProvider.');
  return confirm;
}
