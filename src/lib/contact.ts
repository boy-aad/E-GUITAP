import { CONTACTS } from '../content/company';

/** Lien WhatsApp « click to chat » avec un message pré-rempli. */
export const whatsappUrl = (message?: string) =>
  `https://wa.me/${CONTACTS.whatsapp.raw}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

/** Lien mailto avec objet et corps pré-remplis. */
export const mailtoUrl = (subject?: string, body?: string) => {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString().replace(/\+/g, '%20');
  return `mailto:${CONTACTS.email.raw}${query ? `?${query}` : ''}`;
};

export const telUrl = () => `tel:${CONTACTS.phone.raw}`;
