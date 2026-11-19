import { useState, type FormEvent } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router';
import { KeyRound, Loader2 } from 'lucide-react';
import { Field, Input } from '../../components/ui/Field';
import { supabase } from '../../lib/supabase';
import { AuthShell, authCardClass } from '../AuthShell';
import { Notice, primaryButton } from '../ui';

const MIN_LENGTH = 10;

/**
 * Arrivée depuis un lien d'invitation ou de réinitialisation : Supabase ouvre la session à partir
 * de l'adresse (getSession attend ce traitement). Sans session, le lien est invalide ou expiré.
 */
export async function loader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return { email: session?.user.email ?? null };
}

type Errors = { password?: string; confirmation?: string; form?: string };

export function Component() {
  const { email } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found: Errors = {};
    if (password.length < MIN_LENGTH) found.password = `Au moins ${MIN_LENGTH} caractères.`;
    if (confirmation !== password) found.confirmation = 'Les deux saisies ne correspondent pas.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setPending(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (error) {
      setErrors({ form: /different|same/i.test(error.message) ? 'Choisissez un mot de passe différent de l’ancien.' : `Modification impossible : ${error.message}` });
      return;
    }
    navigate('/admin', { replace: true });
  };

  if (!email) {
    return (
      <AuthShell title="Lien expiré" heading="Lien invalide ou expiré">
        <div className={authCardClass}>
          <Notice tone="error">Ce lien n'est plus valable : il a déjà servi ou a expiré.</Notice>
          <p className="text-sm text-slate-text">Demandez un nouveau lien depuis la page « Mot de passe oublié ».</p>
          <Link to="/admin/mot-de-passe-oublie" className={`${primaryButton} w-full`}>
            Recevoir un nouveau lien
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Nouveau mot de passe" heading="Choisir un mot de passe">
      <form onSubmit={onSubmit} noValidate className={authCardClass}>
        <p className="text-sm text-slate-text">
          Compte : <span className="font-semibold text-marine">{email}</span>
        </p>
        {errors.form && <Notice tone="error">{errors.form}</Notice>}
        {/* Identifiant caché : les gestionnaires de mots de passe associent le nouveau mot de passe au bon compte. */}
        <input type="email" autoComplete="username" value={email} readOnly hidden />
        <Field label="Nouveau mot de passe" required hint={`${MIN_LENGTH} caractères minimum. Une phrase de passe facile à retenir convient.`} error={errors.password}>
          <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Confirmation" required error={errors.confirmation}>
          <Input type="password" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
        </Field>
        <button type="submit" disabled={pending} className={`${primaryButton} w-full`}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <KeyRound className="h-4 w-4" aria-hidden="true" />}
          Enregistrer et accéder à l'administration
        </button>
      </form>
    </AuthShell>
  );
}
