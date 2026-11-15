import { Link } from 'react-router';
import { Home } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { NAV_ITEMS } from '../components/layout/navigation';

export function NotFoundPage() {
  return (
    <>
      <Seo title="Page introuvable" description="La page demandée n'existe pas ou a été déplacée." />
      <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <p className="font-poppins text-6xl font-bold text-gold">404</p>
        <h1 className="mt-4 font-poppins text-2xl font-bold text-marine sm:text-3xl">Page introuvable</h1>
        <p className="mt-3 text-slate-text">La page demandée n'existe pas ou a été déplacée.</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded bg-marine px-6 py-3 font-poppins text-xs font-bold uppercase tracking-wider text-white hover:bg-marine-dark"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Retour à l'accueil
        </Link>
        <nav aria-label="Pages principales" className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          {NAV_ITEMS.filter((i) => i.to !== '/').map((item) => (
            <Link key={item.to} to={item.to} className="text-slate-text hover:text-marine hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
      </section>
    </>
  );
}
