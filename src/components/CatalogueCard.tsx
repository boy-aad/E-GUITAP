import React from 'react';
import { CatalogueItem } from '../data/catalogue';
import { MapPin, ArrowRight } from 'lucide-react';

interface CatalogueCardProps {
  item: CatalogueItem;
  onSelect: (item: CatalogueItem) => void;
  onOpenQuote: (item: CatalogueItem) => void;
}

export const CatalogueCard: React.FC<CatalogueCardProps> = ({
  item,
  onSelect,
  onOpenQuote,
}) => {
  // Status style helper
  const getStatusBadge = () => {
    switch (item.status) {
      case 'disponible':
        return (
          <span className="inline-flex items-center text-[10px] font-semibold text-[#009460] bg-[#009460]/10 px-2 py-0.5 rounded">
            {item.statusLabel}
          </span>
        );
      case 'sur-demande':
        return (
          <span className="inline-flex items-center text-[10px] font-semibold text-[#C6A15B] bg-[#C6A15B]/15 px-2 py-0.5 rounded">
            {item.statusLabel}
          </span>
        );
      case 'non-disponible':
        return (
          <span className="inline-flex items-center text-[10px] font-semibold text-[#CE1126] bg-[#CE1126]/10 px-2 py-0.5 rounded">
            {item.statusLabel}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-lg border border-slate-200/90 hover:border-[#C6A15B] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Visual Asset Container */}
      <div
        className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onSelect(item)}
      >
        <img
          src={item.image}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Measured dark scrim for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#102C50]/80 via-[#102C50]/20 to-transparent opacity-80" />

        {/* Top Badges: Category & Ref */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-medium text-white">
          <span className="bg-[#102C50]/90 backdrop-blur-sm px-2.5 py-1 rounded text-white font-['Poppins'] text-[10px] font-bold uppercase tracking-wider border border-white/20">
            {item.categoryLabel}
          </span>
          <span className="bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded text-white/90 font-mono text-[10px]">
            {item.refCode}
          </span>
        </div>

        {/* Bottom Overlaid Info on image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 text-xs text-white/90">
            <MapPin className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3
            onClick={() => onSelect(item)}
            className="text-base font-bold text-[#102C50] group-hover:text-[#C6A15B] transition-colors cursor-pointer line-clamp-2 font-['Poppins'] leading-snug"
          >
            {item.title}
          </h3>

          <p className="text-xs text-[#44505F] line-clamp-2 leading-relaxed font-['Inter']">
            {item.shortDescription}
          </p>

          {/* Key Domain Specific Attributes (Single-line unboxed text) */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            {item.attributes.slice(0, 2).map((attr, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <span className="text-[#44505F]">{attr.label}</span>
                <span className="font-semibold text-[#102C50]">{attr.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price & Action Area */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[#44505F]">Tarif indicatif</span>
            <span className="text-xs font-bold text-[#102C50] font-['Poppins']">
              {item.priceDisplay}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelect(item)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#102C50] hover:text-[#C6A15B] bg-[#F5F1E8]/60 hover:bg-[#F5F1E8] rounded transition-colors"
            >
              <span>Détails</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
