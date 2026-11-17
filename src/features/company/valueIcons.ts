import { BadgeCheck, Handshake, Lightbulb, Scale, ShieldCheck, Smile, Sparkles, Users, type LucideIcon } from 'lucide-react';

// Icône d'une valeur, déduite de son libellé (les valeurs sont saisies dans l'administration).
// Une valeur inconnue reçoit l'icône par défaut : aucune valeur n'est inventée ici.
const RULES: [RegExp, LucideIcon][] = [
  [/professionnal/i, BadgeCheck],
  [/int[ée]grit|transparen/i, Scale],
  [/respect.*engagement/i, ShieldCheck],
  [/engagement/i, Handshake],
  [/innov/i, Lightbulb],
  [/[ée]quipe/i, Users],
  [/satisfaction|client/i, Smile],
];

export function valueIcon(value: string): LucideIcon {
  return RULES.find(([re]) => re.test(value))?.[1] ?? Sparkles;
}
