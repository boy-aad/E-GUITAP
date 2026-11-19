import { Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import { stockImage } from '../content/stockPhotos';
import { useSiteContent } from '../data/useSiteContent';
import { InquiryForm } from '../features/inquiry/InquiryForm';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { Reveal } from '../components/ui/Reveal';
import { SocialLinks } from '../components/layout/SocialLinks';
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
      <PageHero
        eyebrow="Contact"
        title={intro?.title ?? 'Contacter E-GUITAP'}
        crumbs={[{ label: 'Contact' }]}
        image={stockImage('pageContact')}
      >
        {intro?.body && <p>{intro.body}</p>}
      </PageHero>

      <Section tone="paper" compact>
        <div className="grid gap-10 lg:grid-cols-5">
        <section aria-labelledby="coordonnees" className="space-y-4 lg:col-span-2">
          <h2 id="coordonnees" className="font-poppins text-xl font-bold text-marine">
            Coordonnées
          </h2>
          <ul className="space-y-3">
            {channels.map(({ icon: Icon, label, value, href, external }, i) => {
              const content = (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-marine text-gold">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-slate-text">{label}</span>
                    <span className="block break-all font-semibold text-marine">{value}</span>
                  </span>
                </>
              );
              const box = 'flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5';
              return (
                <Reveal as="li" variant="left" delay={i * 80} key={label}>
                  {href ? (
                    <a
                      href={href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className={`${box} transition-all hover:border-gold hover:shadow-[0_20px_50px_-20px_rgba(16,44,80,0.35)]`}
                    >
                      {content}
                    </a>
                  ) : (
                    <div className={box}>{content}</div>
                  )}
                </Reveal>
              );
            })}
          </ul>
          {contacts.social.length > 0 && (
            <div className="rounded-xl bg-marine p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-gold">Suivez-nous</p>
              <SocialLinks links={contacts.social} />
            </div>
          )}
        </section>

        <Reveal variant="right" delay={120} className="lg:col-span-3">
        <Card as="section" aria-labelledby="demande" className="p-6 sm:p-10">
          <h2 id="demande" className="mb-6 font-poppins text-xl font-bold text-marine">
            Demande de renseignements
          </h2>
          <InquiryForm />
        </Card>
        </Reveal>
        </div>
      </Section>
    </>
  );
}
