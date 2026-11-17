import { ArrowRight, Mail, MapPin, MessageSquare, Phone, type LucideIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Section } from '../../components/ui/Section';
import { Reveal } from '../../components/ui/Reveal';
import { useSiteContent } from '../../data/useSiteContent';
import { DEFAULT_WHATSAPP_MESSAGE, mailtoUrl, telUrl, whatsappUrl } from '../../lib/contact';

type Channel = { icon: LucideIcon; label: string; value: string; href: string | null; external?: boolean };

/** Contact rapide (fin de l'accueil) : uniquement les coordonnées publiées. */
export function QuickContact() {
  const { contacts } = useSiteContent();
  const candidates: (Channel | null)[] = [
    contacts.phone && { icon: Phone, label: contacts.phone.label, value: contacts.phone.value, href: telUrl(contacts.phone.raw) },
    contacts.whatsapp && {
      icon: MessageSquare,
      label: contacts.whatsapp.label,
      value: contacts.whatsapp.value,
      href: whatsappUrl(contacts.whatsapp.raw, DEFAULT_WHATSAPP_MESSAGE),
      external: true,
    },
    contacts.email && { icon: Mail, label: contacts.email.label, value: contacts.email.value, href: mailtoUrl(contacts.email.raw) },
    contacts.address && { icon: MapPin, label: contacts.address.label, value: contacts.address.value, href: null },
  ];
  const channels = candidates.filter((c): c is Channel => c !== null);

  if (channels.length === 0) return null;

  return (
    <Section
      tone="white"
      compact
      id="contact-rapide"
      eyebrow="Contact"
      title="Nous joindre"
      action={
        <Button variant="secondary" to="/contact" iconRight={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
          Page contact
        </Button>
      }
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map(({ icon: Icon, label, value, href, external }, i) => {
          const body = (
            <>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-marine text-gold">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-slate-text">{label}</span>
                <span className="block break-words font-semibold text-marine">{value}</span>
              </span>
            </>
          );
          const box = 'flex h-full items-center gap-4 rounded-xl border border-slate-200 bg-paper p-5';
          return (
            <Reveal as="li" key={label} delay={i * 60}>
              {href ? (
                <a
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`${box} transition-all hover:border-gold hover:bg-white hover:shadow-[0_20px_50px_-20px_rgba(16,44,80,0.35)] focus-visible:outline-2 focus-visible:outline-gold`}
                >
                  {body}
                </a>
              ) : (
                <div className={box}>{body}</div>
              )}
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
