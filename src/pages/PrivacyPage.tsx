import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import { useSiteContent } from '../data/useSiteContent';

// Texte à faire valider par un juriste au regard de la législation guinéenne sur les
// données personnelles (durée de conservation notamment).

export function PrivacyPage() {
  const { contacts } = useSiteContent();
  return (
    <>
      <Seo title="Confidentialité" description="Politique de confidentialité du site E-GUITAP." />
      <PageHero eyebrow="Informations légales" title="Politique de confidentialité" />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-14 text-sm leading-relaxed text-slate-text sm:px-6 lg:py-20">
        <section className="space-y-3">
          <h2 className="font-poppins text-xl font-bold text-marine">Demandes de renseignements</h2>
          <p>
            Lorsque vous envoyez une demande depuis le site, E-GUITAP enregistre les informations que
            vous saisissez : nom, organisation, téléphone, e-mail, sujet et message, ainsi que la date
            de votre accord. Ces informations servent uniquement à répondre à votre demande. Elles ne
            sont ni vendues ni cédées à des tiers.
          </p>
          <p>
            Elles sont conservées dans la base de données du site, accessible aux seules personnes
            habilitées d'E-GUITAP, et transmises par e-mail à l'équipe pour traitement. Elles sont
            conservées le temps nécessaire au suivi de votre demande.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-poppins text-xl font-bold text-marine">Prestataires techniques</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Supabase : hébergement de la base de données du site.</li>
            <li>Resend : envoi de l'e-mail de notification à E-GUITAP.</li>
            <li>
              Cloudflare Turnstile : protection du formulaire contre les robots ; ce service analyse
              des informations techniques de votre navigateur.
            </li>
            <li>Google Fonts : chargement des polices de caractères, qui transmet l'adresse IP du visiteur.</li>
          </ul>
          <p>Le site n'utilise ni cookie publicitaire ni outil de mesure d'audience.</p>
        </section>
        <section className="space-y-3">
          <h2 className="font-poppins text-xl font-bold text-marine">Échanges par WhatsApp</h2>
          <p>
            Si vous choisissez de nous écrire sur WhatsApp, vos échanges relèvent de ce service. Les
            informations que vous nous transmettez sont utilisées uniquement pour vous répondre.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-poppins text-xl font-bold text-marine">Vos droits</h2>
          <p>
            Vous pouvez demander l'accès, la rectification ou la suppression des informations vous
            concernant en contactant E-GUITAP
            {contacts.email && (
              <>
                {' '}à{' '}
                <a href={`mailto:${contacts.email.raw}`} className="font-semibold text-marine underline">
                  {contacts.email.value}
                </a>
              </>
            )}
            .
          </p>
        </section>
      </div>
    </>
  );
}
