import { useState, type FormEvent } from 'react';
import { Link, redirect, useNavigate, useSearchParams } from 'react-router';
import { Loader2, LogIn } from 'lucide-react';
import { Field, Input } from '../../components/ui/Field';
import { supabase } from '../../lib/supabase';
import { AuthShell, authCardClass } from '../AuthShell';
import { safeNext } from '../auth';
import { Notice, primaryButton } from '../ui';

/** Déjà connecté : on va directement dans l'administration. */
export async function loader({ request }: { request: Request }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) throw redirect(safeNext(new URL(request.url).searchParams.get('suite')));
  return null;
}

export function Component() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get('erreur') === 'acces' ? "Ce compte n'a pas accès à l'administration." : null,
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setPending(false);
    if (authError) {
      setError(
        authError.message.toLowerCase().includes('invalid')
          ? 'E-mail ou mot de passe incorrect.'
          : `Connexion impossible : ${authError.message}`,
      );
      return;
    }
    navigate(safeNext(params.get('suite')), { replace: true });
  };

  return (
    <AuthShell title="Connexion" heading="Administration">
      <form onSubmit={onSubmit} className={authCardClass}>
        {error && <Notice tone="error">{error}</Notice>}
        <Field label="E-mail" required>
          <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Mot de passe" required>
          <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <button type="submit" disabled={pending} className={`${primaryButton} w-full`}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
          Se connecter
        </button>
        <p className="text-center text-sm">
          <Link to="/admin/mot-de-passe-oublie" className="font-semibold text-marine underline underline-offset-2 hover:text-marine-dark">
            Mot de passe oublié ?
          </Link>
        </p>
      </form>
      <p className="text-center text-xs text-slate-text">
        Accès réservé à l'équipe E-GUITAP.{' '}
        <a href="/" className="font-semibold text-marine underline">
          Retour au site
        </a>
      </p>
    </AuthShell>
  );
}
