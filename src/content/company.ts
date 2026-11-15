import type { CompanyContact, CompanyProfile } from './types';

// Source : informations communiquées par E-GUITAP et charte graphique v1.3
// (section 01 « Présentation de la marque »). Ne rien ajouter qui n'y figure pas.

export const COMPANY: CompanyProfile = {
  brandName: 'E-GUITAP',
  fullName: "Entreprise Guinéenne de Terrassement, d'Aménagement et de Prestations",
  country: 'République de Guinée',
  headOffice: 'Dubréka et Conakry',
  ambition: "Intervenir à terme sur l'ensemble du territoire national et à l'international.",
  presentation: [
    "E-GUITAP est une entreprise guinéenne ambitieuse qui intervient dans plusieurs secteurs stratégiques : le bâtiment et les travaux publics (BTP), l'immobilier, l'aménagement foncier, le commerce général et l'import-export.",
    "Elle ambitionne de contribuer au développement économique et infrastructurel de la Guinée à travers des projets structurants, des solutions immobilières adaptées et des partenariats stratégiques.",
    "Elle se positionne comme un acteur engagé dans la réalisation de projets, la valorisation foncière et le développement d'opportunités d'affaires.",
  ],
  mission:
    "Proposer des solutions fiables et innovantes dans les domaines de la construction, de l'immobilier, de l'aménagement et du commerce, tout en contribuant au développement de notre environnement économique.",
  vision:
    "Devenir une entreprise de référence en Guinée et en Afrique de l'Ouest dans les domaines du BTP, de l'immobilier et des investissements.",
  values: [
    'Professionnalisme',
    'Intégrité et transparence',
    'Engagement',
    'Innovation',
    "Esprit d'équipe",
    'Respect des engagements',
    'Satisfaction des partenaires et des clients',
  ],
  signatures: {
    brand: 'Construire • Échanger • Développer',
    institutional: 'Une entreprise au service du développement de la Guinée.',
    sectoral: 'BTP • Commerce général • Import-export',
  },
  legal: {
    legalForm: null,
    rccm: null,
    nif: null,
    publicationManager: null,
    host: null,
  },
};

export const CONTACTS = {
  phone: { kind: 'phone', label: 'Téléphone', value: '+224 621 73 02 47', raw: '+224621730247' },
  whatsapp: { kind: 'whatsapp', label: 'WhatsApp', value: '+224 621 73 02 47', raw: '224621730247' },
  email: {
    kind: 'email',
    label: 'E-mail',
    value: 'eguitapimmobilier@gmail.com',
    raw: 'eguitapimmobilier@gmail.com',
  },
  address: {
    kind: 'address',
    label: 'Siège',
    value: 'Dubréka et Conakry, République de Guinée',
    raw: 'Dubréka et Conakry, République de Guinée',
  },
} as const satisfies Record<string, CompanyContact>;
