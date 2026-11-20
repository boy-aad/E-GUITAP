import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

type Toast = { id: number; tone: 'success' | 'error'; message: string; /** En cours de sortie (animation). */ leaving?: boolean };

const ToastContext = createContext<((tone: Toast['tone'], message: string) => void) | null>(null);

/** Durée d'affichage d'un message (ms). Les erreurs restent jusqu'à fermeture. */
const SUCCESS_DURATION = 5000;
/** Durée de la sortie avant retrait du message (alignée sur la transition `.toast`). */
const LEAVE_DURATION = 220;

/** File de messages courts (« Enregistré », « Supprimé »…), annoncés aux lecteurs d'écran. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  // Le message repart par le même chemin qu'à l'entrée, puis il est retiré.
  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), LEAVE_DURATION);
  }, []);
  const push = useCallback(
    (tone: Toast['tone'], message: string) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { id, tone, message }]);
      if (tone === 'success') window.setTimeout(() => dismiss(id), SUCCESS_DURATION);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:right-6">
        {toasts.map((t) => {
          const Icon = t.tone === 'success' ? CheckCircle2 : AlertTriangle;
          return (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              data-leaving={t.leaving ? '' : undefined}
              className={`toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
                t.tone === 'success' ? 'border-emerald-200 bg-white text-slate-800' : 'border-red-200 bg-red-50 text-red-900'
              }`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${t.tone === 'success' ? 'text-emerald-600' : 'text-red-700'}`} aria-hidden="true" />
              <p className="flex-1">{t.message}</p>
              <button type="button" onClick={() => dismiss(t.id)} className="press rounded p-0.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-gold" aria-label="Fermer le message">
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const push = useContext(ToastContext);
  if (!push) throw new Error('useToast doit être utilisé sous ToastProvider.');
  return push;
}

/** Résultats d'action déjà affichés (même objet = même soumission). */
const shownResults = new WeakSet<object>();

/**
 * Affiche une fois le résultat d'une action (`{ ok, message }`) sous forme de toast.
 * Le même objet n'est jamais affiché deux fois (nouvel objet = nouvelle soumission).
 */
export function useResultToast(result: { ok: boolean; message: string } | undefined) {
  const push = useToast();
  useEffect(() => {
    // Mémoire au niveau du module : un composant recréé (clé changée) ne réaffiche pas le message.
    if (!result || shownResults.has(result)) return;
    shownResults.add(result);
    // Les erreurs restent aussi affichées dans la page, à côté du formulaire.
    if (result.ok) push('success', result.message);
  }, [result, push]);
}

/** Toast de succès signalé par un paramètre d'URL après redirection (ex. « ?supprime=1 »). */
export function useFlashToast(active: boolean, message: string) {
  const push = useToast();
  const shown = useRef(false);
  useEffect(() => {
    if (active && !shown.current) {
      shown.current = true;
      push('success', message);
    }
  }, [active, message, push]);
}
