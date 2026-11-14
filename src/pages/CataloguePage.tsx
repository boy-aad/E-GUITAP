import React, { useState, useMemo } from 'react';
import { CATALOGUE_DATA, CatalogueItem } from '../data/catalogue';
import { CatalogueCard } from '../components/CatalogueCard';
import { Search, RotateCcw, Building, Truck, Package, Ship, Layers } from 'lucide-react';

interface CataloguePageProps {
  onSelectItem: (item: CatalogueItem) => void;
  onOpenQuoteModal: (domain?: string, itemRef?: string) => void;
}

export const CataloguePage: React.FC<CataloguePageProps> = ({
  onSelectItem,
  onOpenQuoteModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'title-asc' | 'title-desc'>('default');

  // Category specific filter options
  const [realEstateOpType, setRealEstateOpType] = useState<string>('all');
  const [commerceType, setCommerceType] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Toutes les catégories', icon: Layers },
    { id: 'immobilier', label: 'Immobilier & Foncier', icon: Building },
    { id: 'btp', label: 'BTP & Prestations', icon: Truck },
    { id: 'commerce', label: 'Commerce Général', icon: Package },
    { id: 'import-export', label: 'Import-Export & Fret', icon: Ship },
  ];

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortBy('default');
    setRealEstateOpType('all');
    setCommerceType('all');
  };

  // Filter & Search Logic
  const filteredItems = useMemo(() => {
    return CATALOGUE_DATA.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      // Specific filter: Real Estate Operation
      if (selectedCategory === 'immobilier' && realEstateOpType !== 'all') {
        const opAttr = item.attributes.find((a) => a.label.includes('opération') || a.label.includes('Typologie'));
        if (opAttr && !opAttr.value.toLowerCase().includes(realEstateOpType.toLowerCase())) {
          return false;
        }
      }

      // Specific filter: Commerce Type
      if (selectedCategory === 'commerce' && commerceType !== 'all') {
        if (!item.title.toLowerCase().includes(commerceType.toLowerCase())) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.shortDescription.toLowerCase().includes(query);
        const matchLocation = item.location.toLowerCase().includes(query);
        const matchRef = item.refCode.toLowerCase().includes(query);
        const matchCategory = item.categoryLabel.toLowerCase().includes(query);
        const matchAttributes = item.attributes.some(
          (a) => a.label.toLowerCase().includes(query) || a.value.toLowerCase().includes(query)
        );

        if (!matchTitle && !matchDesc && !matchLocation && !matchRef && !matchCategory && !matchAttributes) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedStatus, sortBy, realEstateOpType, commerceType]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedStatus !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    (realEstateOpType !== 'all' ? 1 : 0) +
    (commerceType !== 'all' ? 1 : 0);

  return (
    <div className="w-full overflow-hidden">
      {/* Catalogue Page Header */}
      <section className="bg-[#102C50] text-white py-12 sm:py-16 border-b border-[#C6A15B]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-[#C6A15B] rounded text-xs font-bold uppercase tracking-wider font-['Poppins']">
              <span>Plateforme Commerciale Institutionnelle</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-['Poppins']">
              Catalogue des opportunités
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-white/80 leading-relaxed font-['Inter']">
              Explorez nos offres certifiées en immobilier, matériaux de construction, prestations BTP
              et logistique portuaire à Conakry et en Guinée.
            </p>
          </div>
        </div>
      </section>

      {/* Main Filter & Interactive Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Top Control Bar: Search and Sort */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-sm space-y-4 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher (ex: Kaloum, ciment, transit, bureau)..."
                className="w-full pl-10 pr-14 py-2.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#C6A15B] bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-600 px-1 py-0.5"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Quick Secondary Filters & Sort */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-start lg:justify-end">
              {/* Status Select */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 sm:px-3 py-2 text-xs rounded border border-slate-300 bg-white text-[#102C50] focus:outline-none focus:ring-1 focus:ring-[#C6A15B]"
              >
                <option value="all">Tous les statuts</option>
                <option value="disponible">Disponible / En stock</option>
                <option value="sur-demande">Sur demande</option>
                <option value="non-disponible">Non disponible</option>
              </select>

              {/* Sort Select */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 sm:px-3 py-2 text-xs rounded border border-slate-300 bg-white text-[#102C50] focus:outline-none focus:ring-1 focus:ring-[#C6A15B]"
              >
                <option value="default">Tri par défaut</option>
                <option value="title-asc">Nom (A → Z)</option>
                <option value="title-desc">Nom (Z → A)</option>
              </select>

              {/* Reset Button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
                  title="Réinitialiser tous les filtres"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Effacer ({activeFiltersCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs (Scrollable on small devices) */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100 pb-1 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setRealEstateOpType('all');
                    setCommerceType('all');
                  }}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold rounded whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#102C50] text-white shadow-sm'
                      : 'bg-slate-100 text-[#44505F] hover:bg-slate-200 hover:text-[#102C50]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Domain-specific Sub-Filters */}
          {selectedCategory === 'immobilier' && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[#44505F] font-semibold text-[11px]">Type de bien :</span>
              {[
                { id: 'all', label: 'Tous' },
                { id: 'appartement', label: 'Appartements' },
                { id: 'bureaux', label: 'Plateaux Bureaux' },
                { id: 'terrain', label: 'Terrains viabilisés' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setRealEstateOpType(sub.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    realEstateOpType === sub.id
                      ? 'bg-[#C6A15B] text-[#102C50] font-bold'
                      : 'bg-[#F5F1E8] text-[#44505F] hover:text-[#102C50]'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          {selectedCategory === 'commerce' && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[#44505F] font-semibold text-[11px]">Matériaux :</span>
              {[
                { id: 'all', label: 'Tous les stocks' },
                { id: 'ciment', label: 'Ciment CPJ' },
                { id: 'fer', label: 'Fer à béton' },
                { id: 'quincaillerie', label: 'Outillage' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setCommerceType(sub.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    commerceType === sub.id
                      ? 'bg-[#C6A15B] text-[#102C50] font-bold'
                      : 'bg-[#F5F1E8] text-[#44505F] hover:text-[#102C50]'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2 text-xs text-[#44505F]">
          <div>
            Affichage de <strong>{filteredItems.length}</strong> élément(s) disponible(s)
          </div>
          {searchQuery && (
            <div>
              Recherche active : <em>« {searchQuery} »</em>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredItems.map((item) => (
              <CatalogueCard
                key={item.id}
                item={item}
                onSelect={onSelectItem}
                onOpenQuote={(itm) => onOpenQuoteModal(itm.category, itm.refCode)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-white rounded-lg border border-slate-200 p-6 sm:p-8 space-y-4">
            <div className="w-12 h-12 bg-[#F5F1E8] text-[#C6A15B] rounded-full flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#102C50] font-['Poppins']">
              Aucun résultat correspondant à votre recherche
            </h3>
            <p className="text-xs text-[#44505F] max-w-md mx-auto">
              Aucune offre ne correspond aux critères sélectionnés. Vous pouvez réinitialiser vos
              filtres ou formuler une demande d’approvisionnement spécifique.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#102C50] text-white text-xs font-bold rounded uppercase tracking-wider font-['Poppins']"
              >
                Réinitialiser les filtres
              </button>
              <button
                onClick={() => onOpenQuoteModal()}
                className="px-4 py-2 bg-[#C6A15B] text-[#102C50] text-xs font-bold rounded uppercase tracking-wider font-['Poppins']"
              >
                Demander un devis sur mesure
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
