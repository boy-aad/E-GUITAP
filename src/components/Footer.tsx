import React from 'react';
import { Logo } from './Logo';
import { COMPANY_DATA } from '../data/company';
import { MapPin, Phone, Mail, MessageSquare, ArrowUp, ShieldCheck } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

interface FooterProps {
  onNavigate: (route: string) => void;
  onOpenLegalModal: () => void;
  onOpenPrivacyModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenLegalModal,
  onOpenPrivacyModal,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-marine text-white pt-12 sm:pt-16 pb-8 sm:pb-10 overflow-hidden border-t-2 border-gold/30">
      {/* Background Graphic Skyline Pattern (Charte Page 15: #173A66 ton sur ton sur marine) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 opacity-20 pointer-events-none select-none flex items-end justify-between px-2 sm:px-4"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1200 120"
          className="w-full h-full text-marine-light fill-current"
          preserveAspectRatio="none"
        >
          <rect x="0" y="80" width="60" height="40" />
          <rect x="70" y="60" width="45" height="60" />
          <rect x="125" y="30" width="70" height="90" />
          <rect x="205" y="50" width="55" height="70" />
          <rect x="270" y="20" width="90" height="100" />
          <rect x="370" y="40" width="80" height="80" />
          <rect x="460" y="70" width="60" height="50" />
          <rect x="530" y="15" width="110" height="105" />
          <rect x="650" y="45" width="75" height="75" />
          <rect x="735" y="25" width="85" height="95" />
          <rect x="830" y="60" width="65" height="60" />
          <rect x="905" y="35" width="95" height="85" />
          <rect x="1010" y="55" width="80" height="65" />
          <rect x="1100" y="10" width="100" height="110" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Tier: Logo, Institutional Signature, Back to Top */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-8 sm:pb-10 border-b border-marine-light gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full md:w-auto">
            <button
              onClick={() => {
                onNavigate('home');
                scrollToTop();
              }}
              className="text-left shrink-0"
              aria-label="E.GUITAP — Retour à l'accueil"
            >
              <Logo variant="horizontal" theme="dark" height={46} />
            </button>
            <div className="hidden sm:block h-8 w-[1px] bg-gold/40 shrink-0" />
            <div>
              <p className="font-lora italic text-gold text-sm sm:text-base">
                {COMPANY_DATA.signatures.primary}
              </p>
              <p className="text-[11px] sm:text-xs text-white/70 mt-0.5">
                {COMPANY_DATA.signatures.institutional}
              </p>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded border border-gold/40 hover:border-gold text-[11px] uppercase tracking-wider text-white hover:text-gold bg-marine-light/40 transition-colors self-end md:self-auto"
            aria-label="Retour en haut de page"
          >
            <span>Haut de page</span>
            <ArrowUp className="w-3.5 h-3.5 text-gold" />
          </button>
        </div>

        {/* Middle Tier: 4 Structured Institutional Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 py-10 sm:py-12 text-sm">
          {/* Col 1: Entreprise */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold font-poppins mb-3 sm:mb-4">
              Entreprise
            </h4>
            <ul className="space-y-2 text-white/80 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => {
                    onNavigate('about');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  À propos de E.GUITAP
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('activities');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Nos 4 pôles d’activité
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('projects');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Galerie des réalisations
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('about');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Valeurs & Charte institutionnelle
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Catalogue & Offres */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold font-poppins mb-3 sm:mb-4">
              Catalogue & Opportunités
            </h4>
            <ul className="space-y-2 text-white/80 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => {
                    onNavigate('catalogue');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Immobilier & Aménagement
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('catalogue');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  BTP & Prestations d’ingénierie
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('catalogue');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Commerce général & Matériaux
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('catalogue');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Import-Export & Fret maritime
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Coordonnées institutionnelles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold font-poppins mb-3 sm:mb-4">
              Siège & Contact
            </h4>
            <div className="space-y-2.5 text-white/80 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>
                  Conakry, République de Guinée
                  <br />
                  <span className="text-white/50">(Adresse exacte du siège à renseigner)</span>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <span className="text-white/70">Tél : à renseigner</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span className="text-white/70">Email : contact@eguitap.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-gold shrink-0" />
                <a
                  href={`https://wa.me/${COMPANY_DATA.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:underline"
                >
                  WhatsApp direct professionnel
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Positionnement */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold font-poppins mb-3 sm:mb-4">
              Positionnement
            </h4>
            <p className="text-xs text-white/75 leading-relaxed">
              Entreprise multisectorielle structurée, partenaire de confiance pour les acteurs
              publics, privés et investisseurs en République de Guinée.
            </p>
            <div className="mt-4 p-3 rounded bg-marine-light/50 border border-gold/30 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
              <div className="text-[11px] text-white/90">
                <span className="font-semibold text-gold">Protocole Officiel</span>
                <p className="text-white/70">Charte graphique v1.0 appliquée</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tier: Guinean Tricolor Line & Legal Bar */}
        <div className="pt-6 sm:pt-8 border-t border-marine-light flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-center sm:text-left">
            <span>© {CURRENT_YEAR} E.GUITAP. Tous droits réservés.</span>
            <span className="hidden sm:inline">·</span>
            <button
              onClick={onOpenLegalModal}
              className="hover:text-gold transition-colors underline-offset-4 hover:underline"
            >
              Mentions légales
            </button>
            <span>·</span>
            <button
              onClick={onOpenPrivacyModal}
              className="hover:text-gold transition-colors underline-offset-4 hover:underline"
            >
              Politique de confidentialité
            </button>
          </div>

          {/* Discreet Guinean Ribbon */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-white/50">Conakry, Guinée</span>
            <div className="inline-flex h-2.5 w-9 rounded-sm overflow-hidden border border-white/20">
              <div className="w-3 bg-gn-red" />
              <div className="w-3 bg-gn-yellow" />
              <div className="w-3 bg-gn-green" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
