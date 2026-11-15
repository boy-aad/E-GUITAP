import { Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import { useSiteContent } from '../data/useSiteContent';
import { InquiryForm } from '../features/inquiry/InquiryForm';
import { mailtoUrl, telUrl, whatsappUrl } from '../lib/contact';

export function ContactPage() {
  const { contacts, blocks } = useSiteContent();
  const intro = blocks['contact.intro'];

  // Seules les coordonnées publiées dans l'administration sont affichées.
  const channels = [
    contacts.address && { icon: MapPin, ...contacts.address, href: null, external: false },
    contacts.phone && { icon: Phone, ...contacts.phone, href: telUrl(contacts.phone.raw), external: false },
    contacts.whatsapp && {
      icon: MessageSquare,
      ...contacts.whatsapp,
      href: whatsappUrl(contacts.whatsapp.raw),
      external: true,
    },
    contacts.email && { icon: Mail, ...contacts.email, href: mailtoUrl(contacts.email.raw), external: false },
  ].filter((c) => c !== null);

  return (
    <>
      <Seo
        title="Contact"
        description="Contacter E-GUITAP à Dubréka et Conakry : téléphone, WhatsApp, e-mail et demande de renseignements."
      />
      <PageHero eyebrow="Contact" title={intro?.title ?? 'Contacter E-GUITAP'}>
        {intro?.body && <p>{intro.body}</p>}
      </PageHero>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8 lg:py-20">
        <section aria-labelledby="coordonnees" className="space-y-4 lg:col-span-2">
          <h2 id="coordonnees" className="font-poppins text-xl font-bold text-marine">
            Coordonnées
          </h2>
          <ul className="space-y-3">
            {channels.map(({ icon: Icon, label, value, href, external }) => {
              const content = (
                <>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-marine text-gold">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-slate-text">{label}</span>
                    <span className="block break-all font-semibold text-marine">{value}</span>
                  </span>
                </>
              );
              const box = 'flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4';
              return (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className={`${box} transition-colors hover:border-gold`}
                    >
                      {content}
                    </a>
                  ) : (
                    <div className={box}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="demande" className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-3">
          <h2 id="demande" className="mb-6 font-poppins text-xl font-bold text-marine">
            Demande de renseignements
          </h2>
          <InquiryForm />
        </section>
      </div>
    </>
  );
}
