import React, { useState } from 'react';
import { X, CheckCircle2, Send, MessageSquare } from 'lucide-react';
import { COMPANY_DATA } from '../data/company';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDomain?: string;
  initialItemRef?: string;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  initialDomain = 'btp',
  initialItemRef = '',
}) => {
  const [domain, setDomain] = useState(initialDomain);
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const err: Record<string, string> = {};
    if (!fullName.trim()) err.fullName = 'Veuillez saisir votre nom complet.';
    if (!email.trim() || !email.includes('@')) err.email = 'Veuillez renseigner une adresse email valide.';
    if (!phone.trim()) err.phone = 'Veuillez renseigner un numéro de téléphone ou WhatsApp.';
    if (!message.trim()) err.message = 'Veuillez décrire brièvement votre besoin ou projet.';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitted(true);
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Bonjour E.GUITAP,\n\nJe souhaite demander un devis / des informations :\n• Domaine : ${domain.toUpperCase()}\n• Nom : ${fullName || 'Client'}\n• Société : ${company || 'Particulier'}\n• Détail : ${message || 'Demande de contact direct'}${
        initialItemRef ? `\n• Réf. Catalogue : ${initialItemRef}` : ''
      }`
    );
    window.open(`https://wa.me/${COMPANY_DATA.whatsappNumber}?text=${text}`, '_blank');
  };

  const resetForm = () => {
    setFullName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setMessage('');
    setErrors({});
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#102C50]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden border border-[#C6A15B]/30 max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-[#102C50] text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-[#C6A15B]/40 shrink-0">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#C6A15B] font-['Poppins']">
              Devis & Cotation Institutionnelle
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-['Poppins']">
              Demande d’étude personnalisée
            </h3>
          </div>
          <button
            onClick={resetForm}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer la boîte de dialogue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {isSubmitted ? (
            <div className="py-6 sm:py-8 text-center space-y-4">
              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="w-7 sm:w-8 h-7 sm:h-8" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-[#102C50] font-['Poppins']">
                Demande de devis enregistrée avec succès
              </h4>
              <p className="text-xs sm:text-sm text-[#44505F] max-w-md mx-auto leading-relaxed">
                <strong className="text-[#102C50]">[Mode prototype institutionnel]</strong> Votre demande a
                été simulée avec succès. Dès raccordement au système d’information de E.GUITAP, un
                responsable technique ou commercial prendra attache avec vous dans les 24 heures.
              </p>

              <div className="p-3.5 bg-[#F5F1E8] rounded border border-[#C6A15B]/30 max-w-md mx-auto text-xs text-left space-y-1">
                <div><strong>Domaine :</strong> {domain.toUpperCase()}</div>
                <div><strong>Contact :</strong> {fullName} ({phone})</div>
                {initialItemRef && <div><strong>Référence :</strong> {initialItemRef}</div>}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
                <button
                  onClick={handleWhatsAppDirect}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#009460] hover:bg-[#007a4f] text-white rounded font-['Poppins'] text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Envoyer également par WhatsApp</span>
                </button>
                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-5 py-3 bg-[#102C50] hover:bg-[#0A1C33] text-white rounded font-['Poppins'] text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <p className="text-xs text-[#44505F]">
                Transmettez les spécifications de votre besoin. Nos équipes techniques évalueront la
                faisabilité, les ressources requises et vous transmettront une cotation conforme.
              </p>

              {initialItemRef && (
                <div className="p-3 bg-[#F5F1E8] rounded border border-[#C6A15B]/40 text-xs flex items-center justify-between">
                  <span className="text-[#102C50] font-medium">
                    Réf. catalogue : <strong>{initialItemRef}</strong>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#C6A15B] tracking-wider">
                    Lié à l'offre
                  </span>
                </div>
              )}

              {/* Domain Selection */}
              <div>
                <label className="block text-xs font-bold text-[#102C50] uppercase tracking-wide mb-1.5 font-['Poppins']">
                  Domaine concerné *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'btp', label: 'BTP & Travaux' },
                    { id: 'immobilier', label: 'Immobilier' },
                    { id: 'commerce', label: 'Commerce' },
                    { id: 'import-export', label: 'Import-Export' },
                  ].map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => setDomain(d.id)}
                      className={`px-2.5 sm:px-3 py-2 text-xs font-semibold rounded border transition-all text-center truncate ${
                        domain === d.id
                          ? 'bg-[#102C50] text-white border-[#102C50] shadow-sm'
                          : 'bg-[#F5F1E8]/50 text-[#44505F] border-slate-200 hover:border-[#C6A15B]'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Identity & Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#102C50] mb-1">
                    Nom et prénom *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Ibrahima Diallo"
                    className={`w-full px-3.5 py-2.5 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-[#C6A15B] ${
                      errors.fullName ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.fullName && (
                    <span className="text-[10px] text-red-600 mt-0.5 block">{errors.fullName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#102C50] mb-1">
                    Société ou organisme (optionnel)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ex: Entreprise / Particulier"
                    className="w-full px-3.5 py-2.5 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#C6A15B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#102C50] mb-1">
                    Adresse email professionnelle *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: contact@entreprise.com"
                    className={`w-full px-3.5 py-2.5 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-[#C6A15B] ${
                      errors.email ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.email && (
                    <span className="text-[10px] text-red-600 mt-0.5 block">{errors.email}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#102C50] mb-1">
                    Téléphone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: +224 62X XX XX XX"
                    className={`w-full px-3.5 py-2.5 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-[#C6A15B] ${
                      errors.phone ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.phone && (
                    <span className="text-[10px] text-red-600 mt-0.5 block">{errors.phone}</span>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-[#102C50] mb-1">
                  Description du projet ou quantités souhaitées *
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Précisez la nature de l'opération, la localisation, les volumes ou la date souhaitée..."
                  className={`w-full px-3.5 py-2.5 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-[#C6A15B] ${
                    errors.message ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.message && (
                  <span className="text-[10px] text-red-600 mt-0.5 block">{errors.message}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#009460] hover:bg-emerald-50 rounded border border-[#009460]/40 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp direct</span>
                </button>

                <div className="w-full sm:w-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-medium text-[#44505F] hover:bg-slate-100 rounded transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#102C50] hover:bg-[#0A1C33] text-white font-['Poppins'] text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-sm"
                  >
                    <span>Soumettre</span>
                    <Send className="w-3.5 h-3.5 text-[#C6A15B]" />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
