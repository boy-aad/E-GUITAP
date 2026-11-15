import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-poppins text-2xl font-bold text-marine">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-text">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  info: 'bg-blue-50 text-blue-800 ring-blue-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-900 ring-amber-200',
  danger: 'bg-red-50 text-red-800 ring-red-200',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${toneClass[tone]}`}>
      {children}
    </span>
  );
}

export function Notice({ tone, children }: { tone: 'success' | 'error'; children: ReactNode }) {
  const Icon = tone === 'success' ? CheckCircle2 : AlertTriangle;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`mb-5 flex items-start gap-2.5 rounded border px-4 py-3 text-sm ${
        tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-800'
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded bg-marine px-4 py-2.5 font-poppins text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-marine-dark disabled:cursor-wait disabled:opacity-70';
export const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 py-2.5 font-poppins text-xs font-bold uppercase tracking-wider text-marine transition-colors hover:bg-ivory';
export const dangerButton =
  'inline-flex items-center justify-center gap-2 rounded border border-red-300 bg-white px-4 py-2.5 font-poppins text-xs font-bold uppercase tracking-wider text-red-700 transition-colors hover:bg-red-50';

export const cardClass = 'rounded-lg border border-slate-200 bg-white';
