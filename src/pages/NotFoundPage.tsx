import { Link } from 'react-router';
import { Home } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { Button } from '../components/ui/Button';
import { NAV_ITEMS } from '../components/layout/navigation';

export function NotFoundPage() {
  return (
    <>
      <Seo title="Page introuvable" description="La page demandée n'existe pas ou a été déplacée." />
      <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:py-32">
        <p className="font-poppins text-7xl font-bold tracking-tight text-gold sm:text-8xl">404</p>
        <h1 className="mt-4 font-poppins text-2xl font-bold text-marine sm:text-3xl">Page introuvable</h1>
        <p className="mt-3 text-slate-text">La page demandée n'existe pas ou a été déplacée.</p>
        <Button variant="dark" to="/" className="mt-8" icon={<Home className="h-4 w-4" aria-hidden="true" />}>
          Retour à l'accueil
        </Button>
        <nav aria-label="Pages principales" className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          {NAV_ITEMS.filter((i) => i.to !== '/').map((item) => (
            <Link key={item.to} to={item.to} className="link-underline text-slate-text hover:text-marine">
              {item.label}
            </Link>
          ))}
        </nav>
      </section>
    </>
  );
}
