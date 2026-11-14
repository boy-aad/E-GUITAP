import React from 'react';
import { X, Shield, FileText } from 'lucide-react';
import { COMPANY_DATA } from '../data/company';

interface LegalModalProps {
  type: 'legal' | 'privacy' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102C50]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden border border-[#C6A15B]/30 max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-[#102C50] text-white px-6 py-4 flex items-center justify-between border-b border-[#C6A15B]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            {type === 'legal' ? (
              <FileText className="w-5 h-5 text-[#C6A15B]" />
            ) : (
              <Shield className="w-5 h-5 text-[#C6A15B]" />
            )}
            <h3 className="text-lg font-bold font-['Poppins']">
              {type === 'legal' ? 'Mentions Légales' : 'Politique de Confidentialité'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto text-xs text-[#44505F] space-y-4 leading-relaxed font-['Inter']">
          {type === 'legal' ? (
            <>
              <div>
                <h4 className="font-bold text-[#102C50] text-sm mb-1 font-['Poppins']">
                  1. Éditeur du site
                </h4>
                <p>
                  Le présent site est édité par la société <strong>{COMPANY_DATA.legalName}</strong>,
                  société à responsabilité limitée de droit guinéen, ayant son siège social à
                  Conakry, République de Guinée.
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Immatriculation / RCCM : À renseigner lors de la mise en production définitive.
                  <br />
                  Directeur de la publication : Direction Générale E.GUITAP.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#102C50] text-sm mb-1 font-['Poppins']">
                  2. Propriété intellectuelle et charte graphique
                </h4>
                <p>
                  L’ensemble des contenus présents sur ce site (structure générale, logotype officiel,
                  textes, chartes graphiques, photographies et pictogrammes institutionnels) sont la
                  propriété exclusive de E.GUITAP ou font l’objet d’une licence d’exploitation. Toute
                  reproduction ou imitation non autorisée du logo E.GUITAP (emblème à blason et
                  typographie stylisée) est strictement prohibée.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#102C50] text-sm mb-1 font-['Poppins']">
                  3. Nature institutionnelle & Démonstration
                </h4>
                <p>
                  Ce prototype web présente les compétences et le catalogue d’opportunités de
                  E.GUITAP. Les chiffres, prix et références indiqués comme "Exemples de présentation"
                  sont des maquettes destinées à la validation commerciale par les dirigeants de
                  l'entreprise avant engagement contractuel formel.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-bold text-[#102C50] text-sm mb-1 font-['Poppins']">
                  1. Collecte et finalité des données
                </h4>
                <p>
                  Les données transmises via les formulaires de demande de devis et de prise de contact
                  (nom, email, téléphone, descriptif de projet) sont destinées exclusivement aux
                  services internes de E.GUITAP afin de traiter vos consultations professionnelles.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#102C50] text-sm mb-1 font-['Poppins']">
                  2. Confidentialité & Non-cession
                </h4>
                <p>
                  E.GUITAP s’engage à ne jamais céder, louer ou commercialiser vos coordonnées à des
                  tiers. Vos informations restent strictement confidentielles dans le cadre des
                  échanges bilatéraux.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#102C50] text-sm mb-1 font-['Poppins']">
                  3. Vos droits
                </h4>
                <p>
                  Vous disposez d’un droit d’accès, de rectification et de suppression des données vous
                  concernant, exerçable sur simple demande par email à l’adresse de contact officielle de
                  E.GUITAP.
                </p>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-200 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#102C50] text-white rounded font-['Poppins'] text-xs font-bold uppercase tracking-wider hover:bg-[#0A1C33]"
            >
              Compris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
