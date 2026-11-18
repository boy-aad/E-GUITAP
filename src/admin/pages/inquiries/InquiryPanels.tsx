import { Link } from 'react-router';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { QUOTE_DETAIL_LABELS, quoteDetailValue, type QuoteDetails } from '../../../features/inquiry/quoteDetails';
import { mailtoUrl, telUrl, whatsappUrl } from '../../../lib/contact';
import { formatDateTime } from '../../format';
import { cardClass } from '../../ui';
import type { DetailData, HistoryEntry } from './inquiryDetail';

type Inquiry = DetailData['inquiry'];

/** Précisions d'une demande de devis (lieu, délai, quantité) ; rien si aucune n'a été saisie. */
export function QuoteDetailsPanel({ details }: { details: unknown }) {
  const d = (details ?? {}) as Partial<QuoteDetails>;
  const keys = (Object.keys(QUOTE_DETAIL_LABELS) as (keyof QuoteDetails)[]).filter((k) => d[k]);
  return (
    <section className={`${cardClass} p-5`} aria-labelledby="precisions-devis">
      <h2 id="precisions-devis" className="mb-3 font-poppins text-base font-bold text-marine">
        Précisions du devis
      </h2>
      {keys.length === 0 ? (
        <p className="text-sm text-slate-600">Aucune précision facultative saisie (lieu, délai, quantité).</p>
      ) : (
        <dl className="divide-y divide-slate-100 text-sm">
          {keys.map((k) => (
            <div key={k} className="grid gap-1 py-2 sm:grid-cols-3">
              <dt className="text-slate-600">{QUOTE_DETAIL_LABELS[k]}</dt>
              <dd className="sm:col-span-2">{quoteDetailValue(k, d[k] ?? '')}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

/** Coordonnées cliquables pour répondre (appel, WhatsApp, e-mail). */
export function ReplyPanel({ inquiry }: { inquiry: Inquiry }) {
  return (
    <section className={`${cardClass} space-y-2 p-5`} aria-labelledby="repondre">
      <h2 id="repondre" className="mb-1 font-poppins text-base font-bold text-marine">
        Répondre
      </h2>
      <a href={telUrl(inquiry.phone)} className="flex items-center gap-2 text-sm hover:underline">
        <Phone className="h-4 w-4 text-gold-hover" aria-hidden="true" /> {inquiry.phone}
      </a>
      <a
        href={whatsappUrl(inquiry.phone, `Bonjour ${inquiry.full_name}, nous revenons vers vous suite à votre demande sur le site E-GUITAP.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm hover:underline"
      >
        <MessageSquare className="h-4 w-4 text-gn-green-hover" aria-hidden="true" /> WhatsApp
      </a>
      {inquiry.email && (
        <a href={mailtoUrl(inquiry.email, `Votre demande — ${inquiry.subject ?? 'E-GUITAP'}`)} className="flex items-center gap-2 break-all text-sm hover:underline">
          <Mail className="h-4 w-4 text-gold-hover" aria-hidden="true" /> {inquiry.email}
        </a>
      )}
    </section>
  );
}

/** Objet de la demande : offre, projet ou domaine, avec lien vers la page publique. */
export function topicLink(inquiry: Inquiry) {
  if (inquiry.activity_services) {
    return (
      <Link to={`/offres/${inquiry.activity_services.slug}`} target="_blank" className="underline">
        {inquiry.activity_services.title}
      </Link>
    );
  }
  if (inquiry.land_projects) {
    return (
      <Link to={`/projets/${inquiry.land_projects.slug}`} target="_blank" className="underline">
        {inquiry.land_projects.name}
      </Link>
    );
  }
  return inquiry.activity_domains?.title ?? inquiry.subject ?? '—';
}

/** Historique de la demande : réception, statuts, assignations. */
export function HistoryPanel({ history }: { history: HistoryEntry[] }) {
  return (
    <section className={`${cardClass} p-5`} aria-labelledby="historique">
      <h2 id="historique" className="mb-3 font-poppins text-base font-bold text-marine">
        Historique
      </h2>
        <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
          {history.map((h, i) => (
            <li key={`${h.at}-${i}`} className="relative text-sm">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-marine" aria-hidden="true" />
              <p className="text-slate-800">{h.text}</p>
              <p className="text-xs text-slate-500">
                {h.who} · {formatDateTime(h.at)}
              </p>
            </li>
          ))}
        </ol>
    </section>
  );
}
