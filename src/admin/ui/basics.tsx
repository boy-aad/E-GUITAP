import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Inbox } from 'lucide-react';

/** En-tête de page : titre, description courte et actions alignées à droite. */
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-poppins text-2xl font-bold text-marine">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  info: 'bg-blue-50 text-blue-800 ring-blue-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-900 ring-amber-200',
  danger: 'bg-red-50 text-red-800 ring-red-200',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${toneClass[tone]}`}>
      {children}
    </span>
  );
}

/** Message dans la page (erreurs de formulaire, alertes durables). Les succès passent par les toasts. */
export function Notice({ tone, children }: { tone: 'success' | 'error' | 'warning'; children: ReactNode }) {
  const Icon = tone === 'success' ? CheckCircle2 : AlertTriangle;
  const look = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
  }[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`mb-5 flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${look}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

const buttonBase =
  'press inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60';
export const primaryButton = `${buttonBase} bg-marine text-white hover:bg-marine-dark`;
export const secondaryButton = `${buttonBase} border border-slate-300 bg-white text-slate-800 hover:bg-slate-50`;
export const dangerButton = `${buttonBase} border border-red-300 bg-white text-red-700 hover:bg-red-50`;
export const dangerSolidButton = `${buttonBase} bg-red-700 text-white hover:bg-red-800`;
export const ghostButton = `${buttonBase} text-slate-700 hover:bg-slate-100`;

/** Petit bouton icône (monter, descendre, dupliquer…) ; toujours avec aria-label. */
export const iconButton =
  'press rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-marine disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-gold';

export const cardClass = 'rounded-xl border border-slate-200 bg-white';

/** Bloc de formulaire : titre, explication, champs. */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className={`${cardClass} p-5 sm:p-6`}>
      <div className="mb-5">
        <h2 className="font-poppins text-base font-bold text-marine">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** État vide d'une liste. */
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Inbox className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="font-semibold text-slate-800">{title}</p>
      {children && <div className="max-w-md text-sm text-slate-600">{children}</div>}
      {action}
    </div>
  );
}

/** Bloc de chargement (squelette). */
export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`block animate-pulse rounded bg-slate-200 ${className}`} aria-hidden="true" />;
}
