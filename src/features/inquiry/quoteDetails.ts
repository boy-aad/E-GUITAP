// Précisions facultatives d'une demande de devis (aucun prix ni budget demandé), partagées
// entre le formulaire public et l'administration. Clés identiques à l'Edge Function submit-inquiry.

export type QuoteDetails = { lieu: string; delai: string; quantite: string };

export const EMPTY_QUOTE_DETAILS: QuoteDetails = { lieu: '', delai: '', quantite: '' };

export const QUOTE_DELAYS = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'moins_1_mois', label: 'Moins d’un mois' },
  { value: '1_3_mois', label: '1 à 3 mois' },
  { value: 'plus_3_mois', label: 'Plus de 3 mois' },
  { value: 'a_definir', label: 'À définir' },
] as const;

export const QUOTE_DETAIL_LABELS: Record<keyof QuoteDetails, string> = {
  lieu: 'Lieu du chantier ou de livraison',
  delai: 'Délai souhaité',
  quantite: 'Quantité ou surface estimée',
};

/** Valeur lisible d'une précision (le délai est stocké sous forme de code). */
export function quoteDetailValue(key: keyof QuoteDetails, value: string): string {
  if (key === 'delai') return QUOTE_DELAYS.find((d) => d.value === value)?.label ?? value;
  return value;
}
