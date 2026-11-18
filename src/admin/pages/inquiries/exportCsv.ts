import { INQUIRY_STATUS_LABELS, INQUIRY_TYPE_LABELS, formatDateTime } from '../../format';
import { QUOTE_DETAIL_LABELS, quoteDetailValue, type QuoteDetails } from '../../../features/inquiry/quoteDetails';
import { inquiryTopic, type InquiryRow } from './inquiryQuery';

// Export CSV pour Excel : UTF-8 avec BOM, séparateur « ; » (réglage français), fins de ligne CRLF.

const cell = (value: unknown) => {
  const s = value === null || value === undefined ? '' : String(value);
  // Toujours entre guillemets ; guillemets internes doublés. Les formules sont neutralisées
  // (une cellule commençant par =, +, - ou @ ne doit pas être exécutée par le tableur).
  // Les numéros (« +224 621… ») restent intacts.
  const safe = /^[=+\-@]/.test(s) && !/^[+-]?[\d\s().]+$/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

const detail = (row: InquiryRow, key: keyof QuoteDetails) => {
  const d = row.request_details as Partial<QuoteDetails> | null;
  const v = d?.[key];
  return v ? quoteDetailValue(key, v) : '';
};

export function inquiriesToCsv(rows: InquiryRow[], staff: Map<string, string>): string {
  const header = [
    'Reçue le',
    'Nom',
    'Organisation',
    'Téléphone',
    'E-mail',
    'Type',
    'Objet',
    'Statut',
    'Assignée à',
    QUOTE_DETAIL_LABELS.lieu,
    QUOTE_DETAIL_LABELS.delai,
    QUOTE_DETAIL_LABELS.quantite,
    'Message',
    'Notes internes',
  ];
  const lines = rows.map((r) =>
    [
      formatDateTime(r.created_at),
      r.full_name,
      r.organization,
      r.phone,
      r.email,
      INQUIRY_TYPE_LABELS[r.type],
      inquiryTopic(r),
      INQUIRY_STATUS_LABELS[r.status],
      r.assigned_to ? (staff.get(r.assigned_to) ?? 'Membre de l’équipe') : '',
      detail(r, 'lieu'),
      detail(r, 'delai'),
      detail(r, 'quantite'),
      r.message,
      r.internal_notes,
    ]
      .map(cell)
      .join(';'),
  );
  return `﻿${[header.map(cell).join(';'), ...lines].join('\r\n')}\r\n`;
}

/** Fait télécharger le texte comme fichier CSV. */
export function downloadCsv(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
