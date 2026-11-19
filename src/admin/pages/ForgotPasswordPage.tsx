import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Loader2, Mail } from 'lucide-react';
import { Field, Input } from '../../components/ui/Field';
import { supabase } from '../../lib/supabase';
import { AuthShell, authCardClass } from '../AuthShell';
import { Notice, primaryButton } from '../ui';

const RESET_PATH = '/admin/reinitialisation';

/** Demande d'un lien de réinitialisation. Réponse identique que le compte existe ou non. */
export function Component() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setState('sending');
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}${RESET_PATH}` });
    // Seule la limite d'envoi est signalée : ne jamais révéler si l'adresse a un compte.
    if (authError && (authError.status === 429 || /rate limit/i.test(authError.message))) {
      setError('Trop de demandes en peu de temps. Réessayez dans quelques minutes.');
      setState('idle');
      return;
    }
    setState('sent');
  };

  return (
    <AuthShell title="Mot de passe oublié" heading="Mot de passe oublié">
      {state === 'sent' ? (
        <div className={authCardClass} role="status">
          <Notice tone="success">Si un compte de l'équipe correspond à cette adresse, un e-mail vient d'être envoyé avec un lien pour choisir un nouveau mot de passe.</Notice>
          <p className="text-sm text-slate-text">Pensez à vérifier le dossier des courriers indésirables. Le lien n'est valable que pour une durée limitée.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className={authCardClass}>
          <p className="text-sm text-slate-text">Indiquez l'adresse e-mail de votre compte : vous recevrez un lien pour choisir un nouveau mot de passe.</p>
          {error && <Notice tone="error">{error}</Notice>}
          <Field label="E-mail" required>
            <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <button type="submit" disabled={state === 'sending'} className={`${primaryButton} w-full`}>
            {state === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Mail className="h-4 w-4" aria-hidden="true" />}
            Recevoir le lien
          </button>
        </form>
      )}
      <p className="text-center text-sm">
        <Link to="/admin/connexion" className="font-semibold text-marine underline underline-offset-2">
          Retour à la connexion
        </Link>
      </p>
    </AuthShell>
  );
}
