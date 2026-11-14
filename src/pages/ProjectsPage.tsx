import React, { useState } from 'react';
import { PROJECTS_DATA, ProjectItem } from '../data/projects';
import { MapPin, ArrowRight, ShieldAlert, CheckCircle2, X } from 'lucide-react';

interface ProjectsPageProps {
  onOpenQuoteModal: (domain?: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onOpenQuoteModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const filteredProjects = PROJECTS_DATA.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="w-full">
      {/* Header */}
      <section className="bg-[#102C50] text-white py-14 lg:py-16 border-b border-[#C6A15B]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-[#C6A15B] rounded text-xs font-bold uppercase tracking-wider font-['Poppins']">
              <span>Références & Savoir-Faire</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-['Poppins']">
              Nos réalisations & Projets
            </h1>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-['Inter']">
              Découvrez un panorama de nos interventions et chantiers types dans le BTP,
              l’aménagement résidentiel, les plateformes logistiques et les corridors maritimes
              en Guinée.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Important Disclaimer Notice (Section 7 & 10 of prompt) */}
        <div className="mb-8 p-4 rounded-lg bg-[#F5F1E8] border border-[#C6A15B]/50 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
          <div className="text-xs text-[#102C50] space-y-1">
            <span className="font-bold font-['Poppins'] uppercase text-[11px]">
              Note d’information institutionnelle
            </span>
            <p className="text-[#44505F] leading-relaxed">
              Les fiches ci-dessous portent la mention <strong>« Exemple de présentation »</strong>.
              Elles illustrent la typologie d’ouvrages et de missions réalisables par les équipes et
              le parc matériel de E.GUITAP en République de Guinée dans l’attente de l’incorporation
              définitive des fiches chantiers achevés.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {[
            { id: 'all', label: 'Toutes les réalisations' },
            { id: 'btp', label: 'BTP & Génie Civil' },
            { id: 'immobilier', label: 'Immobilier & Résidentiel' },
            { id: 'commerce', label: 'Logistique & Entrepôts' },
            { id: 'import-export', label: 'Opérations Maritimes' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-semibold rounded transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#102C50] text-white shadow-sm'
                  : 'bg-slate-100 text-[#44505F] hover:bg-slate-200 hover:text-[#102C50]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="group bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div
                className="relative h-56 bg-slate-100 overflow-hidden cursor-pointer"
                onClick={() => setSelectedProject(proj)}
              >
                <img
                  src={proj.image}
                  alt={proj.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102C50]/80 via-transparent to-transparent" />

                {/* Explicit Required Badge */}
                <div className="absolute top-3 left-3 bg-[#102C50]/90 text-[#C6A15B] px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-[#C6A15B]/40 font-['Poppins']">
                  Exemple de présentation
                </div>

                <div className="absolute bottom-3 left-3 text-white text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C6A15B]" />
                  <span>{proj.location}</span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
                    {proj.categoryLabel}
                  </div>
                  <h3
                    onClick={() => setSelectedProject(proj)}
                    className="text-lg font-bold text-[#102C50] group-hover:text-[#C6A15B] transition-colors cursor-pointer font-['Poppins']"
                  >
                    {proj.title}
                  </h3>
                  <p className="text-xs text-[#44505F] leading-relaxed line-clamp-3">
                    {proj.summary}
                  </p>
                </div>

                {/* Scope Preview */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-[#102C50]">
                  {proj.scope.slice(0, 2).map((s, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#009460] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{s}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedProject(proj)}
                    className="text-xs font-semibold text-[#102C50] hover:text-[#C6A15B] inline-flex items-center gap-1.5"
                  >
                    <span>Fiche descriptive</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenQuoteModal(proj.category)}
                    className="text-xs font-semibold text-[#C6A15B] hover:underline"
                  >
                    Projet similaire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102C50]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden border border-[#C6A15B]/30 max-h-[85vh] flex flex-col">
            <div className="bg-[#102C50] text-white px-6 py-4 flex items-center justify-between border-b border-[#C6A15B]/40 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
                  {selectedProject.categoryLabel}
                </span>
                <h3 className="text-lg font-bold font-['Poppins']">
                  {selectedProject.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              <div className="h-60 w-full rounded overflow-hidden bg-slate-100 relative">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-[#102C50]/90 text-[#C6A15B] px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-[#C6A15B]/40">
                  Exemple de présentation
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-[#102C50] mb-1 font-['Poppins']">
                  Localisation & Cadre du projet
                </h4>
                <p className="text-xs text-[#44505F]">{selectedProject.location} — {selectedProject.year}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-[#102C50] mb-1 font-['Poppins']">
                  Descriptif technique
                </h4>
                <p className="text-xs text-[#44505F] leading-relaxed">
                  {selectedProject.summary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-[#102C50] mb-2 font-['Poppins']">
                  Missions et livrables d’ingénierie
                </h4>
                <div className="space-y-1.5 text-xs text-[#102C50]">
                  {selectedProject.scope.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#009460] shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 text-xs font-medium text-[#44505F] hover:bg-slate-100 rounded"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    const cat = selectedProject.category;
                    setSelectedProject(null);
                    onOpenQuoteModal(cat);
                  }}
                  className="px-5 py-2 bg-[#102C50] text-white rounded text-xs font-bold uppercase tracking-wider font-['Poppins'] hover:bg-[#0A1C33]"
                >
                  Demander une cotation similaire
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
