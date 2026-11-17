import { Link } from 'react-router';
import { ArrowRight, Home } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { Button } from '../components/ui/Button';
import { Skyline, TricolorBand } from '../components/brand/Skyline';
import { NAV_ITEMS } from '../components/layout/navigation';

export function NotFoundPage() {
  return (
    <>
      <Seo title="Page introuvable" description="La page demandée n'existe pas ou a été déplacée." noindex />
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-marine-dark via-marine to-marine-light text-white">
        <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 w-full text-marine-light/70 sm:h-44" />
        <div className="absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-40 pt-20 text-center sm:px-6 lg:pb-48 lg:pt-28">
          <p className="font-poppins text-8xl font-bold tracking-tight text-gold sm:text-9xl" aria-hidden="true">
            404
          </p>
          <h1 className="mt-4 font-poppins text-3xl font-bold tracking-tight sm:text-4xl">Page introuvable</h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">
            La page demandée n'existe pas ou a été déplacée. Les liens ci-dessous vous ramènent vers l'essentiel.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/" size="lg" icon={<Home className="h-4 w-4" aria-hidden="true" />}>
              Retour à l'accueil
            </Button>
            <Button to="/contact" size="lg" variant="secondary" onDark iconRight={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
              Nous contacter
            </Button>
          </div>
          <nav aria-label="Pages principales" className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {NAV_ITEMS.filter((i) => i.to !== '/').map((item) => (
              <Link key={item.to} to={item.to} className="link-underline text-white/80 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <TricolorBand className="relative h-1" />
      </section>
    </>
  );
}
