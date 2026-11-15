import React, { useState } from 'react';
import { ACTIVITIES_DATA } from '../data/activities';
import { Check, ArrowRight, ArrowUpRight, Shield } from 'lucide-react';

interface ActivitiesPageProps {
  onNavigate: (route: string) => void;
  onOpenQuoteModal: (domain?: string) => void;
}

export const ActivitiesPage: React.FC<ActivitiesPageProps> = ({
  onNavigate,
  onOpenQuoteModal,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('btp');

  const scrollToDomain = (slug: string) => {
    setSelectedDomain(slug);
    const el = document.getElementById(`domain-${slug}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Header */}
      <section className="relative bg-marine text-white py-12 sm:py-16 lg:py-20 border-b border-gold/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-gold rounded text-xs font-bold uppercase tracking-wider font-poppins">
              <span>Expertises & Pôles Opérationnels</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-poppins">
              Nos domaines d’activité
            </h1>

            <p className="text-xs sm:text-sm lg:text-base text-white/80 leading-relaxed font-inter">
              Quatre piliers d’excellence conçus pour répondre avec précision aux impératifs
              d’infrastructures, de foncier, d’approvisionnement et d’échanges maritimes de la
              Guinée.
            </p>
          </div>

          {/* Quick Domain Navigation Tabs (Horizontally scrollable on mobile) */}
          <div className="mt-6 sm:mt-8 flex gap-2 pt-4 border-t border-white/10 overflow-x-auto pb-2 scrollbar-none">
            {ACTIVITIES_DATA.map((act) => (
              <button
                key={act.slug}
                onClick={() => scrollToDomain(act.slug)}
                className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  selectedDomain === act.slug
                    ? 'bg-gold text-marine font-bold shadow-sm'
                    : 'bg-marine-light text-white hover:bg-marine-light/80'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">{act.number}</span>
                <span>{act.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Domain Sections */}
      <div className="divide-y divide-slate-200">
        {ACTIVITIES_DATA.map((activity, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <section
              key={activity.id}
              id={`domain-${activity.slug}`}
              className={`py-12 sm:py-16 lg:py-20 scroll-mt-24 ${isEven ? 'bg-white' : 'bg-ivory/30'}`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center ${
                    isEven ? '' : 'lg:grid-flow-dense'
                  }`}
                >
                  {/* Visual Image Column */}
                  <div className={`lg:col-span-6 ${isEven ? '' : 'lg:col-start-7'}`}>
                    <div className="relative rounded-lg overflow-hidden shadow-lg border border-slate-200 aspect-[4/3] bg-slate-100 group">
                      <img
                        src={activity.image}
                        alt={activity.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-marine/80 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 font-mono font-bold text-white bg-marine/90 px-2.5 sm:px-3 py-1 rounded text-[11px] sm:text-xs border border-white/20">
                        PÔLE {activity.number}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white text-xs">
                        <div className="font-bold text-gold uppercase tracking-wider font-poppins text-[11px] sm:text-xs">
                          E.GUITAP {activity.title}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className={`lg:col-span-6 space-y-4 sm:space-y-6 ${isEven ? '' : 'lg:col-start-1'}`}>
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gold font-poppins">
                        Domaine d’intervention {activity.number}
                      </div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-marine font-poppins leading-tight">
                        {activity.title}
                      </h2>
                      <p className="text-xs sm:text-sm font-medium text-marine italic font-lora">
                        {activity.shortDescription}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-text leading-relaxed font-inter">
                      {activity.fullDescription}
                    </p>

                    {/* Prestations Clés */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-marine font-poppins">
                        Services & Prestations Clés
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-text">
                        {activity.keyServices.map((service, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-gn-green shrink-0 mt-0.5" />
                            <span>{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Points forts */}
                    <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-slate-200 text-xs space-y-2 shadow-sm">
                      <span className="font-bold text-marine uppercase tracking-wider text-[10px] sm:text-[11px] font-poppins flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-gold" />
                        <span>Garanties & Engagements</span>
                      </span>
                      <ul className="space-y-1 text-slate-text">
                        {activity.advantages.map((adv, aIdx) => (
                          <li key={aIdx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        onClick={() => onOpenQuoteModal(activity.slug)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-marine hover:bg-marine-dark text-white rounded font-poppins text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                      >
                        <span>Demander une étude {activity.title}</span>
                        <ArrowUpRight className="w-4 h-4 text-gold" />
                      </button>

                      <button
                        onClick={() => onNavigate('catalogue')}
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-marine hover:text-gold transition-colors py-1"
                      >
                        <span>Voir les offres du catalogue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
