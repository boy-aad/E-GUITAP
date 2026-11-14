import React, { useState } from 'react';
import { COMPANY_DATA } from '../data/company';
import { ACTIVITIES_DATA } from '../data/activities';
import { CATALOGUE_DATA, CatalogueItem } from '../data/catalogue';
import { PROJECTS_DATA } from '../data/projects';
import { CatalogueCard } from '../components/CatalogueCard';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  TrendingUp,
  Globe2,
  Layers,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onOpenQuoteModal: (domain?: string, itemRef?: string) => void;
  onSelectCatalogueItem: (item: CatalogueItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenQuoteModal,
  onSelectCatalogueItem,
}) => {
  const [activeCatalogueCategory, setActiveCatalogueCategory] = useState<string>('all');

  // Filter catalogue
  const filteredCatalogue = CATALOGUE_DATA.filter((item) => {
    if (activeCatalogueCategory === 'all') return true;
    return item.category === activeCatalogueCategory;
  });

  return (
    <div className="w-full overflow-hidden">
      {/* SECTION 2 — HERO / BANNIÈRE PRINCIPALE */}
      <section className="relative min-h-[500px] sm:min-h-[580px] lg:min-h-[660px] flex items-center bg-[#102C50] text-white overflow-hidden">
        {/* Background Architectural Photography with Measured Deep Navy Veil */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_conakry_architecture_1794150312428.jpg"
            alt="Infrastructure et architecture à Conakry — E.GUITAP"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Measured Gradients for WCAG contrast compliance */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#102C50]/95 via-[#102C50]/85 to-[#102C50]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102C50] via-transparent to-[#102C50]/30" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 w-full">
          <div className="max-w-3xl space-y-4 sm:space-y-6">
            {/* Top Tag: Location & Nation */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-white/10 backdrop-blur-md rounded border border-white/20 text-[#C6A15B] text-[10px] sm:text-xs font-bold tracking-widest uppercase font-['Poppins']">
              <span>CONAKRY — GUINÉE</span>
              <span className="text-white/40">·</span>
              <span className="text-white/90 font-normal">Entreprise Multisectorielle</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-['Poppins'] leading-[1.2] text-balance">
              « Bâtir avec rigueur,
              <br />
              <span className="text-[#C6A15B]">échanger avec confiance. »</span>
            </h1>

            {/* Description Text */}
            <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed font-['Inter'] max-w-2xl">
              E.GUITAP accompagne le développement à travers ses activités dans le BTP,
              l’immobilier, le commerce général et l’import-export.
            </p>

            {/* Brand Signature */}
            <div className="pt-1">
              <p className="font-['Lora'] italic text-[#C6A15B] text-base sm:text-lg lg:text-xl">
                « {COMPANY_DATA.signatures.primary} »
              </p>
            </div>

            {/* Dual Responsive CTAs */}
            <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => onNavigate('activities')}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-[#C6A15B] hover:bg-[#B59048] text-[#102C50] font-['Poppins'] text-xs font-bold uppercase tracking-wider rounded transition-all duration-200 shadow-md active:scale-[0.98]"
              >
                <span>Découvrir nos activités</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('catalogue')}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-white/10 hover:bg-white/20 text-white font-['Poppins'] text-xs font-bold uppercase tracking-wider rounded border border-white/30 backdrop-blur-sm transition-all duration-200"
              >
                <span>Explorer le catalogue</span>
                <ArrowUpRight className="w-4 h-4 text-[#C6A15B]" />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative corner indicator in gold */}
        <div
          className="hidden lg:block absolute bottom-6 right-8 w-24 h-24 border-r-2 border-b-2 border-[#C6A15B]/40 pointer-events-none"
          aria-hidden="true"
        />
      </section>

      {/* SECTION 3 — PRÉSENTATION DE L'ENTREPRISE */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            {/* Visual Photography Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-lg overflow-hidden shadow-lg border border-slate-200 aspect-[4/3] bg-slate-100">
                <img
                  src="/src/assets/images/btp_construction_site_1794150314495.jpg"
                  alt="Équipe technique et ingénierie E.GUITAP"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102C50]/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white text-xs">
                  <div className="font-bold text-[#C6A15B] font-['Poppins'] uppercase tracking-wider text-[10px] sm:text-[11px]">
                    Présence Terrain
                  </div>
                  <div className="text-white/90 text-[11px] sm:text-xs">
                    Ingénieurs et conducteurs de travaux en action à Conakry
                  </div>
                </div>
              </div>

              {/* Offset Accent Card */}
              <div className="hidden sm:block absolute -bottom-5 -right-5 bg-[#102C50] text-white p-4 sm:p-5 rounded-lg shadow-lg border border-[#C6A15B]/40 max-w-[220px]">
                <div className="text-[#C6A15B] font-bold font-['Poppins'] text-xs sm:text-sm uppercase tracking-wide">
                  Ancrage national
                </div>
                <div className="text-[11px] text-white/80 mt-1">
                  Une structure intégrée pour répondre aux défis guinéens.
                </div>
              </div>
            </div>

            {/* Editorial Presentation Column */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
                <span>Institutionnel</span>
                <span className="text-slate-300">·</span>
                <span>Conakry, Guinée</span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-[#102C50] font-['Poppins'] leading-tight">
                « Une entreprise, plusieurs expertises. »
              </h2>

              <p className="text-xs sm:text-sm lg:text-base text-[#44505F] leading-relaxed font-['Inter']">
                Basée à Conakry, <strong>E.GUITAP</strong> développe ses activités autour de
                secteurs complémentaires, avec une ambition commune : contribuer au développement
                économique et accompagner les besoins de ses clients et partenaires.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1 sm:pt-2">
                <div className="p-3.5 sm:p-4 rounded-lg bg-[#F5F1E8]/60 border border-slate-200">
                  <div className="font-bold text-[#102C50] text-xs sm:text-sm font-['Poppins'] mb-1">
                    Méthode & Transparence
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#44505F] leading-relaxed">
                    Des engagements tenables, une gouvernance claire et un suivi régulier de chaque phase.
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-lg bg-[#F5F1E8]/60 border border-slate-200">
                  <div className="font-bold text-[#102C50] text-xs sm:text-sm font-['Poppins'] mb-1">
                    Connectivité Internationale
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#44505F] leading-relaxed">
                    Un réseau d’approvisionnement mondial au service de l’économie guinéenne.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('about')}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#102C50] hover:text-[#C6A15B] font-['Poppins'] group"
                >
                  <span>En savoir plus sur E.GUITAP</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#C6A15B]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — NOS DOMAINES D'ACTIVITÉ */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#F5F1E8]/35 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2 sm:space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
              Expertises Intégrées
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102C50] font-['Poppins']">
              Nos domaines d’expertise
            </h2>
            <p className="text-xs sm:text-sm text-[#44505F] font-['Inter']">
              Des compétences diversifiées au service de vos projets.
            </p>
          </div>

          {/* 4 Cards Grid: Responsive 1 col on mobile, 2 on tablet, 4 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {ACTIVITIES_DATA.map((activity) => (
              <div
                key={activity.id}
                className="group flex flex-col bg-white rounded-lg border border-slate-200 hover:border-[#C6A15B] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Visual Asset Container */}
                <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100">
                  <img
                    src={activity.image}
                    alt={activity.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102C50]/80 via-[#102C50]/20 to-transparent" />
                  <div className="absolute top-3 left-3 text-[10px] sm:text-[11px] font-bold font-mono text-white bg-[#102C50]/80 px-2 py-0.5 rounded">
                    {activity.number}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#102C50] font-['Poppins'] group-hover:text-[#C6A15B] transition-colors">
                      {activity.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#44505F] leading-relaxed line-clamp-3">
                      {activity.shortDescription}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onNavigate('activities')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#102C50] group-hover:text-[#C6A15B] transition-colors font-['Poppins']"
                    >
                      <span>Découvrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenQuoteModal(activity.slug)}
                      className="text-[11px] text-[#C6A15B] hover:underline"
                    >
                      Devis
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — CATALOGUE / NOS OPPORTUNITÉS */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
                Offres & Prestations
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102C50] font-['Poppins']">
                Découvrez nos opportunités
              </h2>
              <p className="text-xs sm:text-sm text-[#44505F]">
                Retrouvez une sélection de biens, produits, offres et services proposés par E.GUITAP.
              </p>
            </div>

            <button
              onClick={() => onNavigate('catalogue')}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#102C50] hover:bg-[#0A1C33] text-white rounded text-xs font-bold uppercase tracking-wider font-['Poppins'] transition-colors self-start md:self-auto shrink-0"
            >
              <span>Voir tout le catalogue</span>
              <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
            </button>
          </div>

          {/* Interactive Category Filter Tabs (Scrollable on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 scrollbar-none">
            {[
              { id: 'all', label: 'Tous les domaines' },
              { id: 'immobilier', label: 'Immobilier' },
              { id: 'btp', label: 'BTP & Prestations' },
              { id: 'commerce', label: 'Produits & Commerce' },
              { id: 'import-export', label: 'Import-Export' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCatalogueCategory(cat.id)}
                className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded transition-all whitespace-nowrap ${
                  activeCatalogueCategory === cat.id
                    ? 'bg-[#102C50] text-white shadow-sm'
                    : 'bg-[#F5F1E8]/70 text-[#44505F] hover:bg-[#F5F1E8] hover:text-[#102C50]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Catalogue Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredCatalogue.slice(0, 6).map((item) => (
              <CatalogueCard
                key={item.id}
                item={item}
                onSelect={onSelectCatalogueItem}
                onOpenQuote={(itm) => onOpenQuoteModal(itm.category, itm.refCode)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — POURQUOI E.GUITAP ? */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#102C50] text-white relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-2 sm:space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
              Engagements Institutionnels
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Poppins']">
              « Un partenaire engagé à vos côtés. »
            </h2>
            <p className="text-xs sm:text-sm text-white/80 font-['Inter']">
              Quatre axes directeurs qui guident nos interventions et forgent la confiance de nos
              partenaires en Guinée et à l'international.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {COMPANY_DATA.pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-[#173A66]/30 border border-[#C6A15B]/30 hover:border-[#C6A15B] p-5 sm:p-6 rounded-lg transition-colors space-y-2.5 sm:space-y-3"
              >
                <div className="w-10 h-10 rounded bg-[#C6A15B]/15 border border-[#C6A15B]/40 flex items-center justify-center text-[#C6A15B]">
                  {idx === 0 && <Layers className="w-5 h-5" />}
                  {idx === 1 && <TrendingUp className="w-5 h-5" />}
                  {idx === 2 && <Building2 className="w-5 h-5" />}
                  {idx === 3 && <Globe2 className="w-5 h-5" />}
                </div>

                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
                  {pillar.subtitle}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white font-['Poppins']">
                  {pillar.title}
                </h3>

                <p className="text-[11px] sm:text-xs text-white/75 leading-relaxed font-['Inter']">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — NOS RÉALISATIONS */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
                Galerie de Projets
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102C50] font-['Poppins']">
                Nos réalisations
              </h2>
              <p className="text-xs sm:text-sm text-[#44505F]">
                Aperçu des chantiers et opérations types illustrant le niveau d’exigence technique
                de E.GUITAP.
              </p>
            </div>

            <button
              onClick={() => onNavigate('projects')}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#102C50] hover:text-[#C6A15B] font-['Poppins'] self-start md:self-auto"
            >
              <span>Consulter toutes les réalisations</span>
              <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
            </button>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {PROJECTS_DATA.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                className="group bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative h-44 sm:h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102C50]/80 via-transparent to-transparent" />

                  {/* Mandatory Demo Indicator */}
                  <div className="absolute top-3 left-3 bg-[#102C50]/90 text-[#C6A15B] px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-[#C6A15B]/40 font-['Poppins']">
                    Exemple de présentation
                  </div>

                  <div className="absolute bottom-3 left-3 text-white text-[11px] sm:text-xs">
                    <span className="font-semibold">{proj.location}</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
                      {proj.categoryLabel}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#102C50] font-['Poppins'] mt-1">
                      {proj.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#44505F] mt-2 line-clamp-2 leading-relaxed">
                      {proj.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-right">
                    <button
                      onClick={() => onNavigate('projects')}
                      className="text-xs font-semibold text-[#102C50] hover:text-[#C6A15B] inline-flex items-center gap-1"
                    >
                      <span>Voir la fiche</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — APPEL À L'ACTION */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#102C50] text-white relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#173A66] text-[#C6A15B] text-xs font-bold uppercase tracking-wider font-['Poppins'] border border-[#C6A15B]/30">
            <span>Opportunités & Partenariats</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Poppins'] leading-tight">
            « Vous avez un projet ou une opportunité à partager ? »
          </h2>

          <p className="text-xs sm:text-sm lg:text-base text-white/80 max-w-2xl mx-auto font-['Inter'] leading-relaxed">
            « Échangeons autour de vos besoins et construisons ensemble de nouvelles perspectives. »
          </p>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#C6A15B] hover:bg-[#B59048] text-[#102C50] font-['Poppins'] text-xs font-bold uppercase tracking-wider rounded transition-all duration-200 shadow-md"
            >
              <span>Contactez-nous</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenQuoteModal()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-transparent hover:bg-white/10 text-white font-['Poppins'] text-xs font-bold uppercase tracking-wider rounded border border-[#C6A15B] transition-colors"
            >
              <span>Demander un devis</span>
              <ArrowUpRight className="w-4 h-4 text-[#C6A15B]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
