import { Link } from 'react-router';
import { Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { Skyline, TricolorBand } from '../brand/Skyline';
import { Container } from '../ui/Section';
import { useSiteContent } from '../../data/useSiteContent';
import { mailtoUrl, telUrl, whatsappUrl } from '../../lib/contact';
import { SocialLinks } from './SocialLinks';
import { NAV_ITEMS } from './navigation';

const CURRENT_YEAR = new Date().getFullYear();

const headingClass = 'mb-5 font-inter text-xs font-semibold uppercase tracking-[0.15em] text-gold';
const linkClass = 'link-underline text-white/75 transition-colors hover:text-white';

export function Footer() {
  const { company, contacts, domains } = useSiteContent();
  return (
    <footer className="relative overflow-hidden bg-marine-dark text-white">
      <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-marine/80" />

      <Container className="relative pb-8 pt-16 lg:pt-20">
        <div className="grid gap-12 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.4fr]">
          <div className="space-y-5">
            {/* Logo complet : 320 px de large minimum (charte p. 11). */}
            <Logo theme="dark" className="h-[108px] max-w-none" />
            {company.signatures.institutional && (
              <p className="max-w-xs text-sm leading-relaxed text-white/70">{company.signatures.institutional}</p>
            )}
            {company.signatures.brand && <p className="font-lora italic text-gold">{company.signatures.brand}</p>}
            <SocialLinks links={contacts.social} />
          </div>

          <nav aria-label="Plan du site">
            <h2 className={headingClass}>Navigation</h2>
            <ul className="space-y-2.5 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {domains.length > 0 && (
            <div>
              <h2 className={headingClass}>Nos offres</h2>
              <ul className="space-y-2.5 text-sm">
                {domains.map((d) => (
                  <li key={d.slug}>
                    <Link to={`/offres?categorie=${d.slug}`} className={linkClass}>
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className={headingClass}>Contact</h2>
            <ul className="space-y-3.5 text-sm text-white/75">
              {contacts.address && (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <span>{contacts.address.value}</span>
                </li>
              )}
              {contacts.phone && (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <a href={telUrl(contacts.phone.raw)} className={linkClass}>
                    {contacts.phone.value}
                  </a>
                </li>
              )}
              {contacts.whatsapp && (
                <li className="flex gap-3">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <a href={whatsappUrl(contacts.whatsapp.raw)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    WhatsApp
                  </a>
                </li>
              )}
              {contacts.email && (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <a href={mailtoUrl(contacts.email.raw)} className={`break-all ${linkClass}`}>
                    {contacts.email.value}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-white/60 sm:flex-row">
          <p>
            © {CURRENT_YEAR} {company.brandName}. Tous droits réservés.
          </p>
          <div className="flex gap-5">
            <Link to="/mentions-legales" className="link-underline hover:text-white">
              Mentions légales
            </Link>
            <Link to="/confidentialite" className="link-underline hover:text-white">
              Confidentialité
            </Link>
          </div>
        </div>
      </Container>
      <TricolorBand className="relative h-1" />
    </footer>
  );
}
