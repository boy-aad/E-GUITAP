import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import { useSiteContent } from '../data/useSiteContent';

// À réviser à l'étape D (enregistrement des demandes en base) et à faire valider
// par un juriste au regard de la législation guinéenne sur les données personnelles.

export function PrivacyPage() {
  const { contacts } = useSiteContent();
  return (
    <>
      <Seo title="Confidentialité" description="Politique de confidentialité du site E-GUITAP." />
      <PageHero eyebrow="Informations légales" title="Politique de confidentialité" />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-14 text-sm leading-relaxed text-slate-text sm:px-6 lg:py-20">
        <section className="space-y-3">
          <h2 className="font-poppins text-xl font-bold text-marine">Données collectées par le site</h2>
          <p>
            Le site n'enregistre aucune donnée personnelle. Le formulaire de demande de renseignements
            prépare un message qui s'ouvre dans WhatsApp ou dans votre messagerie : c'est vous qui
            choisissez de l'envoyer à E-GUITAP.
          </p>
          <p>
            Le site n'utilise ni cookie publicitaire ni outil de mesure d'audience. Ses polices de
            caractères sont chargées depuis Google Fonts, qui reçoit à cette occasion l'adresse IP du
            visiteur.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-poppins text-xl font-bold text-marine">Messages reçus</h2>
          <p>
            Les informations que vous transmettez par WhatsApp ou par e-mail (nom, coordonnées, message)
            sont utilisées uniquement pour répondre à votre demande. Elles ne sont ni vendues ni cédées à
            des tiers.
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
