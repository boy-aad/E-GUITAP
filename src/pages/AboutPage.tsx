import React from 'react';
import { COMPANY_DATA } from '../data/company';
import { Target, Compass, MapPin } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (route: string) => void;
  onOpenQuoteModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenQuoteModal }) => {
  return (
    <div className="w-full overflow-hidden">
      {/* 1. Internal Hero Banner */}
      <section className="relative bg-[#102C50] text-white py-12 sm:py-16 lg:py-20 border-b border-[#C6A15B]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-[#C6A15B] rounded text-xs font-bold uppercase tracking-wider font-['Poppins']">
              <span>Institutionnel</span>
              <span className="text-white/40">·</span>
              <span>Conakry, Guinée</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-['Poppins']">
              À propos de E.GUITAP
            </h1>

            <p className="font-['Lora'] italic text-[#C6A15B] text-base sm:text-lg lg:text-xl">
              « {COMPANY_DATA.signatures.primary} »
            </p>

            <p className="text-xs sm:text-sm lg:text-base text-white/80 leading-relaxed font-['Inter']">
              Découvrez la vision, les valeurs et les principes directeurs d’une entreprise
              multisectorielle engagée au service du développement économique de la République de
              Guinée.
            </p>
          </div>
        </div>
      </section>

      {/* 2. General Presentation & Positioning */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
                Qui sommes-nous ?
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#102C50] font-['Poppins'] leading-tight">
                Une entreprise structurée, ambitieuse et ouverte sur le monde
              </h2>

              <p className="text-xs sm:text-sm text-[#44505F] leading-relaxed font-['Inter']">
                Entreprise guinéenne basée à Conakry, <strong>E.GUITAP</strong> intervient dans
                quatre domaines majeurs : le <strong>BTP (Bâtiment et Travaux Publics)</strong>,
                l’<strong>immobilier et l’aménagement</strong>, le <strong>commerce général</strong>{' '}
                et l’<strong>import-export</strong>.
              </p>

              <p className="text-xs sm:text-sm text-[#44505F] leading-relaxed font-['Inter']">
                Notre structure a été conçue pour rassurer tant les maîtres d’ouvrage locaux que les
                partenaires commerciaux, investisseurs et institutions internationales. En évitant
                le cloisonnement mono-sectoriel, nous articulons une vision globale des projets, de
                l’approvisionnement en matériaux jusqu’à la livraison finale des ouvrages.
              </p>

              <div className="p-3.5 sm:p-4 bg-[#F5F1E8]/70 rounded border-l-4 border-[#C6A15B] text-xs text-[#102C50] space-y-1">
                <span className="font-bold font-['Poppins'] uppercase text-[10px] sm:text-[11px] text-[#102C50]">
                  Personnalité de marque
                </span>
                <p className="italic text-[#44505F]">
                  « Solide comme un bâtiment, ouverte comme un port : sérieuse, fiable, accessible,
                  ambitieuse. Elle parle avec assurance, sans emphase. »
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-lg overflow-hidden shadow-lg border border-slate-200 aspect-[4/3] bg-slate-100">
                <img
                  src="/src/assets/images/hero_conakry_architecture_1794150312428.jpg"
                  alt="Infrastructure E.GUITAP"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mission & Vision */}
      <section className="py-12 sm:py-16 bg-[#F5F1E8]/40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Mission */}
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm space-y-3 sm:space-y-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded bg-[#102C50] text-[#C6A15B] flex items-center justify-center">
                <Target className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
                Notre Mission
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#102C50] font-['Poppins']">
                « {COMPANY_DATA.signatures.institutional} »
              </h3>

              <p className="text-xs sm:text-sm text-[#44505F] leading-relaxed">
                Agir en catalyseur de développement économique en fournissant des infrastructures
                solides, des biens immobiliers conformes aux règles de l'art, et en sécurisant les
                chaînes d’approvisionnement et flux commerciaux nationaux et internationaux.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm space-y-3 sm:space-y-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded bg-[#102C50] text-[#C6A15B] flex items-center justify-center">
                <Compass className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
                Notre Vision
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#102C50] font-['Poppins']">
                Être le partenaire de référence multisectoriel en Guinée
              </h3>

              <p className="text-xs sm:text-sm text-[#44505F] leading-relaxed">
                Développer un modèle d’entreprise moderne qui conjugue rigueur technique, éthique
                commerciale et respect des engagements, pour inspirer une confiance durable auprès de
                tous nos interlocuteurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Valeurs Institutionnelles */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
              Principes d’action
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#102C50] font-['Poppins']">
              Nos valeurs fondamentales
            </h2>
            <p className="text-xs sm:text-sm text-[#44505F]">
              Des valeurs vécues au quotidien sur le terrain, dans nos entrepôts et auprès de nos clients.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {COMPANY_DATA.values.map((val, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-lg border border-slate-200 hover:border-[#C6A15B] bg-[#FAFAF7] transition-colors space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#C6A15B] shrink-0" />
                  <h3 className="text-xs sm:text-sm font-bold text-[#102C50] font-['Poppins']">
                    {val.title}
                  </h3>
                </div>
                <p className="text-xs text-[#44505F] leading-relaxed font-['Inter']">
                  {val.description}
                </p>
              </div>
            ))}

            <div className="p-5 sm:p-6 rounded-lg border border-slate-200 hover:border-[#C6A15B] bg-[#FAFAF7] transition-colors space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#009460] shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-[#102C50] font-['Poppins']">
                  Ouverture & Diplomatie Économique
                </h3>
              </div>
              <p className="text-xs text-[#44505F] leading-relaxed font-['Inter']">
                Capacité d'interfaçage bilingue avec des fournisseurs et partenaires internationaux
                en respectant les standards juridiques et de conformité financière.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Présence à Conakry */}
      <section className="py-12 sm:py-16 bg-[#102C50] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-8 space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
                <MapPin className="w-4 h-4" />
                <span>Ancrage à Conakry</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-['Poppins']">
                Au carrefour des dynamiques économiques guinéennes
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-['Inter']">
                Implantée à Conakry, E.GUITAP bénéficie d'un positionnement stratégique à proximité
                immédiate des infrastructures portuaires, des institutions financières et des zones de
                développement urbain de la capitale guinéenne.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <button
                onClick={() => onNavigate('contact')}
                className="w-full px-6 py-3 bg-[#C6A15B] hover:bg-[#B59048] text-[#102C50] rounded text-xs font-bold uppercase tracking-wider font-['Poppins'] transition-colors text-center"
              >
                Prendre contact
              </button>
              <button
                onClick={onOpenQuoteModal}
                className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded border border-white/30 text-xs font-bold uppercase tracking-wider font-['Poppins'] transition-colors text-center"
              >
                Demander un devis
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
