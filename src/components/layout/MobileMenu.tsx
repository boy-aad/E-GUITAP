import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router';
import { ArrowRight, ArrowUpRight, MessageSquare, Phone } from 'lucide-react';
import { Button } from '../ui/Button';
import { useSiteContent } from '../../data/useSiteContent';
import { useInquiry } from '../../features/inquiry/InquiryContext';
import { DEFAULT_WHATSAPP_MESSAGE, telUrl, whatsappUrl } from '../../lib/contact';
import { NAV_ITEMS } from './navigation';

/**
 * Menu mobile plein écran, sous la barre d'en-tête (fermeture : bouton, Échap ou navigation).
 * Toujours monté : il entre et repart par le même chemin, et un appui pendant la transition
 * l'inverse depuis l'état affiché. Fermé, il est masqué et inerte (ni focus, ni lecteur d'écran).
 */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { company, contacts, domains } = useSiteContent();
  const { openInquiry } = useInquiry();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (open) firstLinkRef.current?.focus();
  }, [open]);

  return (
    <div
      id="mobile-menu"
      data-open={open ? '' : undefined}
      inert={!open}
      className="mobile-menu fixed inset-0 -z-10 flex flex-col overflow-y-auto bg-white pt-[78px] sm:pt-[90px] lg:hidden"
    >
      <div className="flex flex-1 flex-col">
        <nav aria-label="Navigation principale" className="mobile-menu-item space-y-1 px-4 py-6 sm:px-6">
          {NAV_ITEMS.map((item, i) => (
            <NavLink
              key={item.to}
              ref={i === 0 ? firstLinkRef : undefined}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `press press-row flex items-center justify-between rounded-md border-b border-slate-100 px-2 py-4 font-poppins text-xl font-bold focus-visible:outline-2 focus-visible:outline-gold ${
                  isActive ? 'text-marine' : 'text-marine/70 hover:text-marine'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  <ArrowRight className={`h-5 w-5 ${isActive ? 'text-gold' : 'text-slate-300'}`} aria-hidden="true" />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {domains.length > 0 && (
          <div className="mobile-menu-item px-4 pb-6 sm:px-6">
            <p className="mb-3 px-2 font-inter text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-text">
              Nos domaines
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm font-medium text-marine">
              {domains.map((d) => (
                <Link key={d.slug} to={`/activites#${d.slug}`} className="press truncate rounded-lg bg-ivory/70 p-3 hover:bg-ivory">
                  {d.letter}. {d.shortTitle}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mobile-menu-item mt-auto space-y-4 border-t border-slate-200 bg-paper px-4 py-6 sm:px-6">
          <Button
            fullWidth
            size="lg"
            onClick={() => {
              onClose();
              openInquiry();
            }}
            iconRight={<ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
          >
            Demande de renseignements
          </Button>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-text">
            {contacts.phone && (
              <a href={telUrl(contacts.phone.raw)} className="flex items-center gap-1.5 hover:text-marine">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {contacts.phone.value}
              </a>
            )}
            {contacts.whatsapp && (
              <a
                href={whatsappUrl(contacts.whatsapp.raw, DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-semibold text-gn-green-hover"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
            )}
          </div>
          {company.signatures.brand && (
            <p className="text-center font-lora text-sm italic text-slate-text">{company.signatures.brand}</p>
          )}
        </div>
      </div>
    </div>
  );
}
