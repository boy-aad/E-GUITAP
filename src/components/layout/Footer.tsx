import { Link } from 'react-router';
import { Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { Skyline, TricolorBand } from '../brand/Skyline';
import { COMPANY, CONTACTS } from '../../content/company';
import { publicDomains } from '../../content/activities';
import { LAND_PROJECTS } from '../../content/landProjects';
import { mailtoUrl, telUrl, whatsappUrl } from '../../lib/contact';
import { NAV_ITEMS } from './navigation';

const CURRENT_YEAR = new Date().getFullYear();

const headingClass = 'mb-4 font-inter text-xs font-semibold uppercase tracking-[0.15em] text-gold';
const linkClass = 'text-white/75 transition-colors hover:text-gold';

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-marine text-white">
      <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-marine-light/60" />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-marine-light pb-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            {/* Logo complet : 320 px de large minimum (charte p. 11). */}
            <Logo theme="dark" className="h-[108px] max-w-none" />
            <p className="text-sm leading-relaxed text-white/75">{COMPANY.signatures.institutional}</p>
            <p className="font-lora italic text-gold">{COMPANY.signatures.brand}</p>
          </div>

          <nav aria-label="Plan du site">
            <h2 className={headingClass}>Navigation</h2>
            <ul className="space-y-2 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={headingClass}>Activités et projets</h2>
            <ul className="space-y-2 text-sm">
              {publicDomains().map((d) => (
                <li key={d.slug}>
                  <Link to={`/activites#${d.slug}`} className={linkClass}>
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-4 space-y-2 border-t border-marine-light pt-4 text-sm">
              {LAND_PROJECTS.map((p) => (
                <li key={p.slug}>
                  <Link to={`/projets/${p.slug}`} className={linkClass}>
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={headingClass}>Contact</h2>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span>{CONTACTS.address.value}</span>
              </li>
              <li>
                <a href={telUrl()} className={`flex gap-2.5 ${linkClass}`}>
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  {CONTACTS.phone.value}
                </a>
              </li>
              <li>
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={`flex gap-2.5 ${linkClass}`}>
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={mailtoUrl()} className={`flex gap-2.5 break-all ${linkClass}`}>
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  {CONTACTS.email.value}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-white/60 sm:flex-row">
          <p>
            © {CURRENT_YEAR} {COMPANY.brandName} — {COMPANY.fullName}
          </p>
          <div className="flex gap-4">
            <Link to="/mentions-legales" className="hover:text-gold hover:underline">
              Mentions légales
            </Link>
            <Link to="/confidentialite" className="hover:text-gold hover:underline">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
      <TricolorBand className="relative h-1" />
    </footer>
  );
}
