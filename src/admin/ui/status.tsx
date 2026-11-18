import type { Enums } from '../../types/database';
import { INQUIRY_STATUS_LABELS, INQUIRY_STATUS_TONE, PUBLICATION_LABELS } from '../format';
import { Badge, type Tone } from './basics';

type Publication = Enums<'publication_status'>;

const PUBLICATION_TONE: Record<Publication, Tone> = { publie: 'success', brouillon: 'warning', archive: 'neutral' };

/** Statut de publication d'un contenu (brouillon / publié / archivé), toujours de la même couleur. */
export function PublicationBadge({ value }: { value: Publication }) {
  return <Badge tone={PUBLICATION_TONE[value]}>{PUBLICATION_LABELS[value]}</Badge>;
}

/** Statut d'une demande. */
export function InquiryStatusBadge({ value }: { value: Enums<'inquiry_status'> }) {
  return <Badge tone={INQUIRY_STATUS_TONE[value]}>{INQUIRY_STATUS_LABELS[value]}</Badge>;
}

// Classes écrites en entier : Tailwind ne détecte pas les noms construits dynamiquement.
const SWITCH_ACTIVE: Record<Publication, string> = {
  brouillon: 'peer-checked:bg-amber-100 peer-checked:text-amber-900 peer-checked:ring-amber-300',
  publie: 'peer-checked:bg-emerald-100 peer-checked:text-emerald-900 peer-checked:ring-emerald-300',
  archive: 'peer-checked:bg-slate-200 peer-checked:text-slate-800 peer-checked:ring-slate-300',
};

/**
 * Choix brouillon / publié / archivé (boutons radio), à placer dans un <Form>.
 * Champ envoyé : `name` (par défaut « publication »).
 */
export function PublishSwitch({ defaultValue, name = 'publication' }: { defaultValue: Publication; name?: string }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold text-marine">Publication</legend>
      <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
        {(Object.keys(PUBLICATION_LABELS) as Publication[]).map((value) => (
          <label key={value} className="cursor-pointer">
            <input type="radio" name={name} value={value} defaultChecked={value === defaultValue} className="peer sr-only" />
            <span
              className={`block rounded-md px-3 py-1.5 text-sm font-semibold text-slate-600 ring-inset transition peer-checked:ring-1 peer-focus-visible:outline-2 peer-focus-visible:outline-gold ${SWITCH_ACTIVE[value]}`}
            >
              {PUBLICATION_LABELS[value]}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
