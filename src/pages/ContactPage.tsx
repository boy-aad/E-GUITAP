import React, { useState } from 'react';
import { COMPANY_DATA } from '../data/company';
import {
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [domain, setDomain] = useState('btp');
  const [message, setMessage] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const err: Record<string, string> = {};
    if (!fullName.trim()) err.fullName = 'Veuillez saisir votre nom complet.';
    if (!email.trim() || !email.includes('@')) err.email = 'Veuillez renseigner une adresse email valide.';
    if (!phone.trim()) err.phone = 'Veuillez renseigner un numéro de téléphone joignable.';
    if (!subject.trim()) err.subject = 'Veuillez indiquer l’objet de votre demande.';
    if (!message.trim()) err.message = 'Veuillez rédiger votre message.';
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
      `Bonjour E.GUITAP,\n\nJe vous contacte depuis le site officiel :\n• Nom : ${fullName || 'Client'}\n• Domaine : ${domain.toUpperCase()}\n• Objet : ${subject || 'Prise de contact générale'}\n• Message : ${message || 'Demande de renseignement'}`
    );
    window.open(`https://wa.me/${COMPANY_DATA.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="w-full">
      {/* Header */}
      <section className="bg-marine text-white py-14 lg:py-16 border-b border-gold/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-gold rounded text-xs font-bold uppercase tracking-wider font-poppins">
              <span>Relation Partenaires & Clients</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-poppins">
              Contactez E.GUITAP
            </h1>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-inter">
              Nos équipes se tiennent à votre disposition pour analyser vos projets dans le BTP,
              l’immobilier, l’approvisionnement commercial et le transit import-export.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid: Contact Details vs Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Institutional Information */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gold font-poppins">
                Siège & Représentation
              </div>
              <h2 className="text-2xl font-bold text-marine font-poppins">
                Échangeons sur vos besoins
              </h2>
              <p className="text-xs sm:text-sm text-slate-text leading-relaxed">
                Une équipe commerciale et technique disponible pour vous orienter, préparer des devis
                détaillés ou fixer un rendez-vous d'affaires.
              </p>
            </div>

            {/* Information Cards */}
            <div className="space-y-4">
              {/* Location */}
              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm flex items-start gap-3.5">
                <div className="p-2.5 rounded bg-marine text-gold shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-marine font-poppins block">
                    Localisation Officielle
                  </span>
                  <p className="text-marine font-medium">Conakry, République de Guinée</p>
                  <p className="text-slate-400 text-[11px]">
                    (Adresse physique exacte du siège à renseigner dans la configuration)
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm flex items-start gap-3.5">
                <div className="p-2.5 rounded bg-marine text-gold shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-marine font-poppins block">
                    Standard Téléphonique
                  </span>
                  <p className="text-marine font-medium">{COMPANY_DATA.phonePlaceholder}</p>
                  <p className="text-slate-400 text-[11px]">Du lundi au vendredi : 08h30 – 17h30 GMT</p>
                </div>
              </div>

              {/* Email */}
              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm flex items-start gap-3.5">
                <div className="p-2.5 rounded bg-marine text-gold shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-marine font-poppins block">
                    Courrier Électronique
                  </span>
                  <p className="text-marine font-medium">{COMPANY_DATA.emailPlaceholder}</p>
                  <p className="text-slate-400 text-[11px]">Réponse garantie sous 24 à 48 heures ouvrées</p>
                </div>
              </div>

              {/* WhatsApp Professional Direct */}
              <div className="p-4 bg-gn-green/10 rounded-lg border border-gn-green/30 shadow-sm flex items-start gap-3.5">
                <div className="p-2.5 rounded bg-gn-green text-white shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-bold text-gn-green font-poppins block">
                    Canal WhatsApp Professionnel
                  </span>
                  <p className="text-marine">
                    Messagerie instantanée directe avec notre service d’orientation commerciale.
                  </p>
                  <button
                    onClick={handleWhatsAppDirect}
                    className="inline-flex items-center gap-1.5 font-bold text-gn-green hover:underline pt-1"
                  >
                    <span>Démarrer un échange WhatsApp</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
              <div className="mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold text-marine font-poppins">
                  Formulaire de contact institutionnel
                </h3>
                <p className="text-xs text-slate-text mt-1">
                  Veuillez renseigner les champs ci-après. Tous les champs marqués d’un astérisque (*)
                  sont obligatoires.
                </p>
              </div>

              {isSubmitted ? (
                <div className="py-8 space-y-4 text-center">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <h4 className="text-xl font-bold text-marine font-poppins">
                    Formulaire validé avec succès
                  </h4>

                  {/* Explicit Mandatory Demo Notice (Section 11) */}
                  <div className="p-4 bg-ivory rounded border border-gold/40 max-w-lg mx-auto text-xs text-left space-y-2">
                    <div className="flex items-start gap-2 text-marine">
                      <AlertCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <div>
                        <strong>Information de démonstration :</strong>
                        <p className="text-slate-text mt-0.5">
                          Ce formulaire fonctionne en mode simulation de prototype. Aucun service
                          backend réel n'étant connecté pour l'instant, le message n'a pas été
                          transmis par serveur de messagerie externe.
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 text-[11px] text-marine">
                      <div><strong>Expéditeur :</strong> {fullName} ({email})</div>
                      <div><strong>Domaine :</strong> {domain.toUpperCase()} — {subject}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <button
                      onClick={handleWhatsAppDirect}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gn-green hover:bg-gn-green-hover text-white rounded font-poppins text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Transmettre aussi sur WhatsApp</span>
                    </button>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-5 py-2.5 bg-marine text-white rounded font-poppins text-xs font-bold uppercase tracking-wider hover:bg-marine-dark"
                    >
                      Nouveau message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nom complet */}
                  <div>
                    <label className="block text-xs font-semibold text-marine mb-1">
                      Nom et prénom *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Mamadou Barry"
                      className={`w-full px-3.5 py-2.5 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-gold ${
                        errors.fullName ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.fullName && (
                      <span className="text-[10px] text-red-600 mt-0.5 block">{errors.fullName}</span>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-marine mb-1">
                        Adresse email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ex: contact@organisation.com"
                        className={`w-full px-3.5 py-2.5 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-gold ${
                          errors.email ? 'border-red-500' : 'border-slate-300'
                        }`}
                      />
                      {errors.email && (
                        <span className="text-[10px] text-red-600 mt-0.5 block">{errors.email}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-marine mb-1">
                        Numéro de téléphone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: +224 620 00 00 00"
                        className={`w-full px-3.5 py-2.5 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-gold ${
                          errors.phone ? 'border-red-500' : 'border-slate-300'
                        }`}
                      />
                      {errors.phone && (
                        <span className="text-[10px] text-red-600 mt-0.5 block">{errors.phone}</span>
                      )}
                    </div>
                  </div>

                  {/* Domain & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-marine mb-1">
                        Domaine concerné *
                      </label>
                      <select
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded border border-slate-300 bg-white text-marine focus:outline-none focus:ring-1 focus:ring-gold"
                      >
                        <option value="btp">BTP & Travaux Publics</option>
                        <option value="immobilier">Immobilier & Aménagement</option>
                        <option value="commerce">Commerce Général & Matériaux</option>
                        <option value="import-export">Import-Export & Logistique</option>
                        <option value="partenariat">Partenariat & Institutionnel</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-marine mb-1">
                        Objet de la demande *
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Ex: Renseignement foncier ou commande ciment"
                        className={`w-full px-3.5 py-2.5 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-gold ${
                          errors.subject ? 'border-red-500' : 'border-slate-300'
                        }`}
                      />
                      {errors.subject && (
                        <span className="text-[10px] text-red-600 mt-0.5 block">{errors.subject}</span>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-marine mb-1">
                      Votre message *
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Détaillez votre besoin, le lieu d'intervention ou vos questions techniques..."
                      className={`w-full px-3.5 py-2.5 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-gold ${
                        errors.message ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.message && (
                      <span className="text-[10px] text-red-600 mt-0.5 block">{errors.message}</span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-marine hover:bg-marine-dark text-white font-poppins text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-sm"
                    >
                      <span>Transmettre le message</span>
                      <Send className="w-3.5 h-3.5 text-gold" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
