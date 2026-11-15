// Liens de contact construits à partir des coordonnées enregistrées dans Supabase.

/** Lien WhatsApp « click to chat » (numéro international sans « + » ni espaces). */
export const whatsappUrl = (number: string, message?: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

/** Lien mailto avec objet et corps pré-remplis. */
export const mailtoUrl = (email: string, subject?: string, body?: string) => {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString().replace(/\+/g, '%20');
  return `mailto:${email}${query ? `?${query}` : ''}`;
};

export const telUrl = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

/** Message par défaut des boutons WhatsApp du site. */
export const DEFAULT_WHATSAPP_MESSAGE = 'Bonjour E-GUITAP, je vous contacte depuis votre site internet.';
