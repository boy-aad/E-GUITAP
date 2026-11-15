import type { ReactNode } from 'react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import { COMPANY, CONTACTS } from '../content/company';

const PENDING = 'Information en cours de publication';

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 sm:grid-cols-3">
      <dt className="font-semibold text-marine">{label}</dt>
      <dd className="text-slate-text sm:col-span-2">{value ?? <span className="italic">{PENDING}</span>}</dd>
    </div>
  );
}

export function LegalNoticePage() {
  const { legal } = COMPANY;
  return (
    <>
      <Seo title="Mentions légales" description="Mentions légales du site E-GUITAP." />
      <PageHero eyebrow="Informations légales" title="Mentions légales" />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-14 sm:px-6 lg:py-20">
        <section className="space-y-3">
          <h2 className="font-poppins text-xl font-bold text-marine">Éditeur du site</h2>
          <dl className="text-sm">
            <Row label="Dénomination" value={COMPANY.fullName} />
            <Row label="Nom commercial" value={COMPANY.brandName} />
            <Row label="Forme juridique" value={legal.legalForm} />
            <Row label="RCCM" value={legal.rccm} />
            <Row label="NIF" value={legal.nif} />
            <Row label="Siège" value={`${COMPANY.headOffice}, ${COMPANY.country}`} />
            <Row label="Téléphone" value={CONTACTS.phone.value} />
            <Row label="E-mail" value={CONTACTS.email.value} />
            <Row label="Responsable de la publication" value={legal.publicationManager} />
          </dl>
        </section>
        <section className="space-y-3">
          <h2 className="font-poppins text-xl font-bold text-marine">Hébergement</h2>
          <dl className="text-sm">
            <Row label="Hébergeur" value={legal.host} />
          </dl>
        </section>
        <section className="space-y-3 text-sm leading-relaxed text-slate-text">
          <h2 className="font-poppins text-xl font-bold text-marine">Informations publiées</h2>
          <p>
            Les informations relatives aux projets fonciers (superficies, descriptions, potentiel de
            développement) sont communiquées par E-GUITAP à titre indicatif. Elles ne constituent ni une
            offre de vente, ni une garantie de disponibilité, de titre foncier ou de viabilisation.
          </p>
          <p>
            Le nom, le logo et la charte graphique E-GUITAP sont la propriété de l'entreprise. Toute
            reproduction sans autorisation est interdite.
          </p>
        </section>
      </div>
    </>
  );
}
