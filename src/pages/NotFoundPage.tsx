import React from 'react';
import { Home, ArrowLeft, Search } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (route: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20 px-4 bg-white">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-[#F5F1E8] text-[#102C50] rounded-full flex items-center justify-center mx-auto border-2 border-[#C6A15B]">
          <span className="font-['Poppins'] font-bold text-2xl text-[#C6A15B]">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#102C50] font-['Poppins']">
            Page non trouvée
          </h1>
          <p className="text-xs sm:text-sm text-[#44505F] font-['Inter'] leading-relaxed">
            La page que vous recherchez n'existe pas ou a été déplacée. Vous pouvez retourner à la
            page d'accueil ou consulter notre catalogue d'opportunités.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#102C50] hover:bg-[#0A1C33] text-white rounded font-['Poppins'] text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Home className="w-4 h-4 text-[#C6A15B]" />
            <span>Retour à l’accueil</span>
          </button>

          <button
            onClick={() => onNavigate('catalogue')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#F5F1E8] hover:bg-[#e9e3d5] text-[#102C50] rounded font-['Poppins'] text-xs font-bold uppercase tracking-wider transition-colors border border-slate-200"
          >
            <Search className="w-4 h-4 text-[#C6A15B]" />
            <span>Explorer le catalogue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
