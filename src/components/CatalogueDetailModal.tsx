import React, { useState } from 'react';
import { CatalogueItem } from '../data/catalogue';
import { COMPANY_DATA } from '../data/company';
import { X, MapPin, Check, MessageSquare, ArrowRight, ShieldAlert } from 'lucide-react';

interface CatalogueDetailModalProps {
  item: CatalogueItem | null;
  onClose: () => void;
  onOpenQuote: (item: CatalogueItem) => void;
  onSelectItem: (item: CatalogueItem) => void;
  relatedItems: CatalogueItem[];
}

export const CatalogueDetailModal: React.FC<CatalogueDetailModalProps> = ({
  item,
  onClose,
  onOpenQuote,
  onSelectItem,
  relatedItems,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!item) return null;

  const currentGallery = item.gallery && item.gallery.length > 0 ? item.gallery : [item.image];
  const activeImage = currentGallery[activeImageIndex] || item.image;

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      `Bonjour E.GUITAP,\n\nJe suis intéressé par l'offre suivante sur votre catalogue :\n• Réf : ${item.refCode}\n• Titre : ${item.title}\n• Domaine : ${item.categoryLabel}\n• Localisation : ${item.location}\n\nMerci de me recontacter pour les disponibilités et conditions.`
    );
    window.open(`https://wa.me/${COMPANY_DATA.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-marine/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden border border-gold/30 max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="bg-marine text-white px-6 py-4 flex items-center justify-between border-b border-gold/40 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-marine-light text-gold rounded border border-gold/30 font-poppins">
              {item.categoryLabel}
            </span>
            <span className="text-xs text-white/70 font-mono">
              Réf : {item.refCode}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer la vue détaillée"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-8 font-inter">
          {/* Main Hero Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual Gallery (Col 1-7) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative h-64 sm:h-80 w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={activeImage}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute bottom-3 left-3 bg-marine/85 backdrop-blur-sm text-white px-3 py-1 rounded text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  <span>{item.location}</span>
                </div>
              </div>

              {/* Thumbnails if multiple images */}
              {currentGallery.length > 1 && (
                <div className="flex items-center gap-2">
                  {currentGallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-16 w-20 rounded overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx ? 'border-gold shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Aperçu" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Core Info & Actions (Col 8-12) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-marine font-poppins leading-tight">
                  {item.title}
                </h1>

                <div className="mt-3 flex items-center gap-3">
                  <div className="text-xs text-slate-text">
                    Statut :{' '}
                    <strong className="text-marine">
                      {item.statusLabel}
                    </strong>
                  </div>
                  <span className="text-slate-300">·</span>
                  <div className="text-xs text-slate-text">
                    Tarif :{' '}
                    <strong className="text-marine">
                      {item.priceDisplay}
                    </strong>
                  </div>
                </div>

                <p className="mt-4 text-xs sm:text-sm text-slate-text leading-relaxed">
                  {item.shortDescription}
                </p>
              </div>

              {/* Action Buttons Box */}
              <div className="p-4 rounded-lg bg-ivory/60 border border-gold/40 space-y-3">
                <button
                  onClick={() => {
                    onClose();
                    onOpenQuote(item);
                  }}
                  className="w-full py-3 px-4 bg-marine hover:bg-marine-dark text-white text-xs font-bold uppercase tracking-wider rounded font-poppins flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <span>Demander une cotation officielle</span>
                  <ArrowRight className="w-4 h-4 text-gold" />
                </button>

                <button
                  onClick={handleWhatsAppContact}
                  className="w-full py-2.5 px-4 bg-gn-green hover:bg-gn-green-hover text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Échanger directement sur WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full Description & Highlights */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-marine font-poppins">
                Présentation détaillée de l’offre
              </h2>
              <p className="text-xs sm:text-sm text-slate-text leading-relaxed whitespace-pre-line">
                {item.fullDescription}
              </p>

              {item.highlights && item.highlights.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gold font-poppins">
                    Points forts & Garanties
                  </h3>
                  <div className="space-y-1.5">
                    {item.highlights.map((high, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-marine">
                        <Check className="w-4 h-4 text-gn-green shrink-0 mt-0.5" />
                        <span>{high}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Technical & Commercial Attributes Table */}
            <div className="lg:col-span-5 bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-marine font-poppins">
                Spécifications & Attributs
              </h2>
              <div className="space-y-2.5">
                {item.attributes.map((attr, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between py-1.5 border-b border-slate-200/80 last:border-0 text-xs"
                  >
                    <span className="text-slate-text font-medium">{attr.label}</span>
                    <span className="text-marine font-semibold text-right max-w-[60%]">
                      {attr.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-gold shrink-0" />
                <span>
                  Informations contractuelles définitives à confirmer lors de l'établissement du devis.
                </span>
              </div>
            </div>
          </div>

          {/* Related Items in the same category */}
          {relatedItems.length > 0 && (
            <div className="pt-8 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-marine font-poppins">
                  Autres opportunités dans le domaine {item.categoryLabel}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedItems.slice(0, 3).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectItem(rel)}
                    className="p-3 bg-white rounded border border-slate-200 hover:border-gold transition-colors cursor-pointer space-y-2 group"
                  >
                    <div className="h-28 w-full rounded overflow-hidden bg-slate-100">
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-xs font-bold text-marine group-hover:text-gold line-clamp-1">
                      {rel.title}
                    </div>
                    <div className="text-[11px] text-slate-text flex items-center justify-between">
                      <span>{rel.location}</span>
                      <span className="font-semibold">{rel.priceDisplay}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
