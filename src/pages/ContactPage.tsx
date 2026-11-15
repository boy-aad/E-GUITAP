import { Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import { CONTACTS } from '../content/company';
import { InquiryForm } from '../features/inquiry/InquiryForm';
import { mailtoUrl, telUrl, whatsappUrl } from '../lib/contact';

const channels = [
  { icon: MapPin, label: CONTACTS.address.label, value: CONTACTS.address.value, href: null, external: false },
  { icon: Phone, label: CONTACTS.phone.label, value: CONTACTS.phone.value, href: telUrl(), external: false },
  { icon: MessageSquare, label: CONTACTS.whatsapp.label, value: CONTACTS.whatsapp.value, href: whatsappUrl(), external: true },
  { icon: Mail, label: CONTACTS.email.label, value: CONTACTS.email.value, href: mailtoUrl(), external: false },
];

export function ContactPage() {
  return (
    <>
      <Seo
        title="Contact"
        description="Contacter E-GUITAP à Dubréka et Conakry : téléphone, WhatsApp, e-mail et demande de renseignements."
      />
      <PageHero eyebrow="Contact" title="Contacter E-GUITAP">
        <p>Une question sur nos activités ou nos projets fonciers ? Écrivez-nous ou appelez-nous.</p>
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
