import { Field, Input, Select } from '../../components/ui/Field';
import { QUOTE_DELAYS, type QuoteDetails } from './quoteDetails';

export { EMPTY_QUOTE_DETAILS, type QuoteDetails } from './quoteDetails';


export function QuoteDetailsFields({
  value,
  onChange,
}: {
  value: QuoteDetails;
  onChange: (next: QuoteDetails) => void;
}) {
  const set = (key: keyof QuoteDetails) => (e: { target: { value: string } }) => onChange({ ...value, [key]: e.target.value });
  return (
    <fieldset className="space-y-4 rounded-lg border border-gold/30 bg-ivory/50 p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-text">Précisions pour le devis</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Lieu du chantier ou de livraison" hint="Facultatif">
          <Input value={value.lieu} onChange={set('lieu')} maxLength={300} placeholder="Ex. : Dubréka, Kassonyah" />
        </Field>
        <Field label="Délai souhaité" hint="Facultatif">
          <Select value={value.delai} onChange={set('delai')}>
            <option value="">Non précisé</option>
            {QUOTE_DELAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Quantité ou surface estimée" hint="Facultatif">
        <Input value={value.quantite} onChange={set('quantite')} maxLength={300} placeholder="Ex. : 2 hectares, 30 camions de latérite" />
      </Field>
    </fieldset>
  );
}
