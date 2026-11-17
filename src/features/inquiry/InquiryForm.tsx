import { useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, MessageSquare, Send } from 'lucide-react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select, Textarea } from '../../components/ui/Field';
import { env } from '../../config/env';
import { supabase } from '../../lib/supabase';
import { DEFAULT_WHATSAPP_MESSAGE, whatsappUrl } from '../../lib/contact';
import { useSiteContent } from '../../data/useSiteContent';
import { Turnstile, type TurnstileHandle } from './Turnstile';
import { buildTopicGroups, type InquiryTopic } from './topics';

type Values = {
  fullName: string;
  organization: string;
  phone: string;
  email: string;
  topic: InquiryTopic;
  message: string;
  consent: boolean;
  website: string; // pot de miel invisible : rempli uniquement par les robots
};

type Errors = Partial<Record<keyof Values | 'captcha', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v: Values, captchaToken: string | null): Errors {
  const errors: Errors = {};
  if (!v.fullName.trim()) errors.fullName = 'Veuillez indiquer votre nom.';
  if (!v.phone.trim()) errors.phone = 'Veuillez indiquer un numéro de téléphone.';
  if (v.email.trim() && !EMAIL_RE.test(v.email.trim())) errors.email = "L'adresse e-mail ne semble pas valide.";
  if (!v.message.trim()) errors.message = 'Veuillez décrire votre demande.';
  if (!v.consent) errors.consent = 'Votre accord est nécessaire pour que nous puissions vous répondre.';
  if (!captchaToken) errors.captcha = 'Merci de patienter pendant la vérification anti-robot.';
  return errors;
}

/** Message d'erreur renvoyé par l'Edge Function, ou message générique. */
async function readFunctionError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = (await error.context.json()) as { error?: string };
      if (body.error) return body.error;
    } catch {
      /* réponse non JSON */
    }
  }
  return "La demande n'a pas pu être envoyée. Vérifiez votre connexion et réessayez.";
}

type InquiryFormProps = {
  initialTopic?: InquiryTopic;
};

/**
 * Demande de renseignements : envoyée à l'Edge Function submit-inquiry, qui vérifie le
 * captcha, enregistre la demande (visible dans l'administration) et prévient E-GUITAP par e-mail.
 */
export function InquiryForm({ initialTopic = 'general' }: InquiryFormProps) {
  const { domains, projects, contacts } = useSiteContent();
  const groups = buildTopicGroups(domains, projects);
  const turnstile = useRef<TurnstileHandle>(null);

  const [values, setValues] = useState<Values>({
    fullName: '',
    organization: '',
    phone: '',
    email: '',
    topic: initialTopic,
    message: '',
    consent: false,
    website: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaFailed, setCaptchaFailed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = (key: Exclude<keyof Values, 'consent'>) => (e: { target: { value: string } }) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const found = validate(values, captchaToken);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus('sending');
    const { error } = await supabase.functions.invoke('submit-inquiry', {
      body: { ...values, turnstileToken: captchaToken, sourcePage: window.location.pathname },
    });
    // Un jeton Turnstile ne sert qu'une fois : on en redemande un dans tous les cas.
    turnstile.current?.reset();
    if (error) {
      setSubmitError(await readFunctionError(error));
      setStatus('idle');
      return;
    }
    setStatus('sent');
  };

  const whatsappLink = contacts.whatsapp && (
    <a
      href={whatsappUrl(contacts.whatsapp.raw, DEFAULT_WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-semibold text-gn-green hover:underline"
    >
      <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
      écrire directement sur WhatsApp
    </a>
  );

  if (status === 'sent') {
    return (
      <div role="status" className="space-y-3 py-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gn-green" aria-hidden="true" />
        <p className="font-poppins text-lg font-bold text-marine">Votre demande a bien été envoyée</p>
        <p className="text-sm text-slate-text">
          Merci {values.fullName.trim()}. L'équipe E-GUITAP a reçu votre message et reviendra vers vous.
        </p>
      </div>
    );
  }

  // Sans clé Turnstile configurée, le formulaire ne peut pas être protégé : on oriente vers WhatsApp.
  if (!env.turnstileSiteKey) {
    return (
      <p className="rounded border border-gold/30 bg-ivory px-4 py-3 text-sm text-slate-text">
        Le formulaire est momentanément indisponible. Vous pouvez {whatsappLink ?? 'nous contacter par téléphone'}.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom et prénom" required error={errors.fullName}>
          <Input autoComplete="name" value={values.fullName} onChange={set('fullName')} maxLength={200} />
        </Field>
        <Field label="Société ou organisation" hint="Facultatif">
          <Input autoComplete="organization" value={values.organization} onChange={set('organization')} maxLength={200} />
        </Field>
        <Field label="Téléphone ou WhatsApp" required error={errors.phone}>
          <Input type="tel" autoComplete="tel" value={values.phone} onChange={set('phone')} maxLength={50} />
        </Field>
        <Field label="E-mail" hint="Facultatif" error={errors.email}>
          <Input type="email" autoComplete="email" value={values.email} onChange={set('email')} maxLength={320} />
        </Field>
      </div>

      <Field label="Sujet de la demande" required>
        <Select value={values.topic} onChange={set('topic')}>
          {groups.map((group) => (
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
        <Textarea rows={5} value={values.message} onChange={set('message')} maxLength={5000} />
      </Field>

      {/* Pot de miel : invisible et ignoré par les lecteurs d'écran. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Site web
          <input type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
        </label>
      </div>

      <div>
        <label className="flex items-start gap-3 text-xs leading-relaxed text-slate-text">
          <input
            type="checkbox"
            checked={values.consent}
            onChange={(e) => setValues((prev) => ({ ...prev, consent: e.target.checked }))}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            className="mt-0.5 h-4 w-4 shrink-0 accent-marine"
          />
          <span>
            J'accepte que E-GUITAP utilise ces informations pour répondre à ma demande. Voir la{' '}
            <Link to="/confidentialite" className="font-semibold text-marine underline" target="_blank">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        {errors.consent && (
          <p id="consent-error" role="alert" className="mt-1 text-[11px] font-medium text-gn-red">
            {errors.consent}
          </p>
        )}
      </div>

      <div>
        <Turnstile
          ref={turnstile}
          siteKey={env.turnstileSiteKey}
          onToken={(token) => {
            setCaptchaToken(token);
            if (token) setCaptchaFailed(false);
          }}
          onError={() => setCaptchaFailed(true)}
        />
        {(errors.captcha || captchaFailed) && !captchaToken && (
          <p role="alert" className="mt-1 text-[11px] font-medium text-gn-red">
            {captchaFailed
              ? 'La vérification anti-robot n’a pas abouti. Rechargez la page pour réessayer, ou écrivez-nous sur WhatsApp.'
              : errors.captcha}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="rounded border border-gn-red/30 bg-red-50 px-3.5 py-2.5 text-xs text-gn-red">
          {submitError}
        </p>
      )}

      <div className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-slate-text">{whatsappLink && <>Vous pouvez aussi {whatsappLink}.</>}</p>
        <Button
          type="submit"
          variant="dark"
          disabled={status === 'sending'}
          className="w-full sm:w-auto"
          icon={
            status === 'sending' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4 text-gold" aria-hidden="true" />
            )
          }
        >
          {status === 'sending' ? 'Envoi en cours…' : 'Envoyer la demande'}
        </Button>
      </div>
    </form>
  );
}
