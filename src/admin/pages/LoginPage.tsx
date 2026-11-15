import { useState, type FormEvent } from 'react';
import { redirect, useNavigate, useSearchParams } from 'react-router';
import { Loader2, LogIn } from 'lucide-react';
import { Logo } from '../../components/brand/Logo';
import { TricolorBand } from '../../components/brand/Skyline';
import { Field, Input } from '../../components/ui/Field';
import { supabase } from '../../lib/supabase';
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
    <div className="flex min-h-screen flex-col bg-paper font-inter text-marine">
      <title>Connexion | Administration E-GUITAP</title>
      <meta name="robots" content="noindex, nofollow" />
      <TricolorBand className="h-1" />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo variant="horizontal-compact" className="h-[60px]" />
            <h1 className="font-poppins text-xl font-bold">Administration</h1>
          </div>
          <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            {error && <Notice tone="error">{error}</Notice>}
            <Field label="E-mail" required>
              <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Mot de passe" required>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <button type="submit" disabled={pending} className={`${primaryButton} w-full`}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
              Se connecter
            </button>
          </form>
          <p className="text-center text-xs text-slate-text">
            Accès réservé à l'équipe E-GUITAP.{' '}
            <a href="/" className="font-semibold text-marine underline">
              Retour au site
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
