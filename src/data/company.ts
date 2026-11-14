export interface CompanyConfig {
  name: string;
  legalName: string;
  country: string;
  city: string;
  addressPlaceholder: string;
  phonePlaceholder: string;
  phoneDisplay: string;
  phoneRaw: string;
  emailPlaceholder: string;
  whatsappNumber: string; // for direct click-to-chat
  whatsappDisplay: string;
  signatures: {
    primary: string; // "Construire • Échanger • Développer"
    institutional: string; // "Une entreprise au service du développement de la Guinée."
    sectoral: string; // "BTP • COMMERCE GÉNÉRAL • IMPORT-EXPORT"
  };
  values: Array<{
    title: string;
    description: string;
  }>;
  pillars: Array<{
    title: string;
    subtitle: string;
    description: string;
  }>;
}

export const COMPANY_DATA: CompanyConfig = {
  name: 'E.GUITAP',
  legalName: 'E.GUITAP SARL',
  country: 'République de Guinée',
  city: 'Conakry',
  addressPlaceholder: 'Conakry, République de Guinée (Coordonnées du siège à préciser)',
  phonePlaceholder: '+224 (Numéro de téléphone à renseigner)',
  phoneDisplay: '+224 620 00 00 00 (Contact de démonstration)',
  phoneRaw: '224620000000',
  emailPlaceholder: 'contact@eguitap.com (Adresse officielle à renseigner)',
  whatsappNumber: '224620000000',
  whatsappDisplay: '+224 620 00 00 00',
  signatures: {
    primary: 'Construire • Échanger • Développer',
    institutional: 'Une entreprise au service du développement de la Guinée.',
    sectoral: 'BTP • COMMERCE GÉNÉRAL • IMPORT-EXPORT',
  },
  values: [
    {
      title: 'Confiance & Crédibilité',
      description:
        'Bâtir des relations pérennes fondées sur la transparence contractuelle, le respect scrupuleux des engagements et des faits avérés.',
    },
    {
      title: 'Professionnalisme & Rigueur',
      description:
        'Appliquer les standards de gestion, de sécurité et d’ingénierie les plus exigeants dans chacun de nos chantiers et opérations commerciales.',
    },
    {
      title: 'Excellence & Stabilité',
      description:
        'Fournir une qualité d’exécution constante et robuste, assurant la durabilité de chaque infrastructure et la fluidité des flux logistiques.',
    },
    {
      title: 'Ambition & Innovation',
      description:
        'Anticiper les besoins émergents de l’économie guinéenne par la modernisation des méthodes, des équipements et des circuits de distribution.',
    },
    {
      title: 'Ancrage Guinéen & Rayonnement',
      description:
        'Fierté d’une entreprise enracinée en Guinée, mobilisant des talents locaux tout en maintenant une ouverture active sur les marchés internationaux.',
    },
  ],
  pillars: [
    {
      title: 'Une approche multisectorielle',
      subtitle: 'Synergie opérationnelle',
      description:
        'La complémentarité de nos 4 domaines (BTP, immobilier, commerce, import-export) permet de maîtriser l’ensemble de la chaîne de valeur d’un projet.',
    },
    {
      title: 'Une vision orientée développement',
      subtitle: 'Impact durable',
      description:
        'Participer activement à l’édification des infrastructures, à la création d’emplois qualifiés et à la valorisation du potentiel économique national.',
    },
    {
      title: 'Une présence ancrée à Conakry',
      subtitle: 'Proximité terrain',
      description:
        'Une connaissance intime des réalités du terrain guinéen, des circuits administratifs, portuaires et des spécificités géotechniques locales.',
    },
    {
      title: 'Une ouverture à l’international',
      subtitle: 'Connectivité globale',
      description:
        'Des capacités d’approvisionnement et de partenariats commerciaux avec l’Afrique de l’Ouest, l’Europe, l’Asie et les Amériques.',
    },
  ],
};
