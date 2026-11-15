import { useState, type FormEvent } from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { Field, Input, Select, Textarea } from '../../components/ui/Field';
import { mailtoUrl, whatsappUrl } from '../../lib/contact';
import { INQUIRY_TOPIC_GROUPS, topicLabel, type InquiryTopic } from './topics';

type Values = {
  fullName: string;
  organization: string;
  phone: string;
  email: string;
  topic: InquiryTopic;
  message: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v: Values): Errors {
  const errors: Errors = {};
  if (!v.fullName.trim()) errors.fullName = 'Veuillez indiquer votre nom.';
  if (!v.phone.trim()) errors.phone = 'Veuillez indiquer un numéro de téléphone.';
  if (v.email.trim() && !EMAIL_RE.test(v.email.trim()))
    errors.email = "L'adresse e-mail ne semble pas valide.";
  if (!v.message.trim()) errors.message = 'Veuillez décrire votre demande.';
  return errors;
}

function buildMessage(v: Values) {
  const details = [
    `Sujet : ${topicLabel(v.topic)}`,
    `Nom : ${v.fullName.trim()}`,
    v.organization.trim() ? `Organisation : ${v.organization.trim()}` : null,
    `Téléphone : ${v.phone.trim()}`,
    v.email.trim() ? `E-mail : ${v.email.trim()}` : null,
  ].filter((line): line is string => line !== null);
  return ['Bonjour E-GUITAP,', details.join('\n'), v.message.trim()].join('\n\n');
}

type InquiryFormProps = {
  initialTopic?: InquiryTopic;
  /** Appelé après l'ouverture de WhatsApp ou de la messagerie. */
  onSent?: () => void;
};

/**
 * Demande de renseignements. En attendant l'enregistrement en base (étape D),
 * la demande est transmise par WhatsApp ou par e-mail depuis l'appareil du visiteur :
 * le site n'enregistre aucune donnée.
 */
export function InquiryForm({ initialTopic = 'general', onSent }: InquiryFormProps) {
  const [values, setValues] = useState<Values>({
    fullName: '',
    organization: '',
    phone: '',
    email: '',
    topic: initialTopic,
    message: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sentVia, setSentVia] = useState<'whatsapp' | 'email' | null>(null);

  const set = (key: keyof Values) => (e: { target: { value: string } }) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const send = (channel: 'whatsapp' | 'email') => {
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const message = buildMessage(values);
    if (channel === 'whatsapp') {
      window.open(whatsappUrl(message), '_blank', 'noopener');
    } else {
      window.location.href = mailtoUrl(
        `Demande de renseignements — ${topicLabel(values.topic)}`,
        message,
      );
    }
    setSentVia(channel);
    onSent?.();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send('whatsapp');
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom et prénom" required error={errors.fullName}>
          <Input autoComplete="name" value={values.fullName} onChange={set('fullName')} />
        </Field>
        <Field label="Société ou organisation" hint="Facultatif">
          <Input autoComplete="organization" value={values.organization} onChange={set('organization')} />
        </Field>
        <Field label="Téléphone ou WhatsApp" required error={errors.phone}>
          <Input type="tel" autoComplete="tel" value={values.phone} onChange={set('phone')} />
        </Field>
        <Field label="E-mail" hint="Facultatif" error={errors.email}>
          <Input type="email" autoComplete="email" value={values.email} onChange={set('email')} />
        </Field>
      </div>

      <Field label="Sujet de la demande" required>
        <Select value={values.topic} onChange={set('topic')}>
          {INQUIRY_TOPIC_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>

      <Field label="Votre message" required error={errors.message}>
        <Textarea rows={5} value={values.message} onChange={set('message')} />
      </Field>

      <p className="rounded border border-gold/30 bg-ivory px-3.5 py-2.5 text-xs leading-relaxed text-slate-text">
        Votre demande s'ouvrira dans WhatsApp ou dans votre messagerie, pré-remplie : il vous
        suffira de l'envoyer. Le site n'enregistre aucune donnée.
      </p>

      {sentVia && (
        <p role="status" className="rounded border border-gn-green/30 bg-gn-green/5 px-3.5 py-2.5 text-xs text-marine">
          {sentVia === 'whatsapp'
            ? "WhatsApp s'est ouvert avec votre message. Pensez à appuyer sur « Envoyer »."
            : "Votre messagerie s'est ouverte avec votre message. Pensez à l'envoyer."}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => send('email')}
          className="inline-flex items-center justify-center gap-2 rounded border border-marine px-5 py-3 font-poppins text-xs font-bold uppercase tracking-wider text-marine transition-colors hover:bg-ivory"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          Envoyer par e-mail
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded bg-gn-green px-5 py-3 font-poppins text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gn-green-hover"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Envoyer par WhatsApp
        </button>
      </div>
    </form>
  );
}
