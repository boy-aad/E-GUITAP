import { IMAGES } from '../assets/images';

export type CatalogueCategory = 'immobilier' | 'commerce' | 'btp' | 'import-export';
export type CatalogueStatus = 'disponible' | 'sur-demande' | 'non-disponible';

export interface AttributeItem {
  label: string;
  value: string;
}

export interface CatalogueItem {
  id: string;
  slug: string;
  refCode: string;
  title: string;
  category: CatalogueCategory;
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  gallery: string[];
  location: string;
  priceDisplay: string; // "Prix sur demande" or specific indication
  status: CatalogueStatus;
  statusLabel: string;
  featured: boolean;
  attributes: AttributeItem[];
  highlights: string[];
  contactSubject: string;
}

export const CATALOGUE_DATA: CatalogueItem[] = [
  // 1. IMMOBILIER
  {
    id: 'item-imm-01',
    slug: 'residence-les-palmiers-kipe',
    refCode: 'EGT-IMM-01',
    title: 'Appartement Haut Standing — Résidence Les Palmiers',
    category: 'immobilier',
    categoryLabel: 'Immobilier & Aménagement',
    shortDescription:
      'Appartement 4 pièces moderne avec balcon panoramique, finitions soignées et groupe électrogène de secours.',
    fullDescription:
      'Situé dans le quartier résidentiel prisé de Kipé à Conakry, cet appartement de standing offre de généreux volumes baignés de lumière naturelle. Conçu selon les normes architecturales contemporaines, l’immeuble dispose d’un accès sécurisé 24h/24, d’une bâche à eau avec surpresseur et d’un groupe électrogène automatique.',
    image: IMAGES.realEstate,
    gallery: [
      IMAGES.realEstate,
      IMAGES.heroConakry,
    ],
    location: 'Conakry (Kipé, Ratoma)',
    priceDisplay: 'Prix sur demande',
    status: 'disponible',
    statusLabel: 'Disponible',
    featured: true,
    attributes: [
      { label: 'Type d’opération', value: 'Vente ou Location' },
      { label: 'Typologie', value: 'Appartement T4 (3 chambres + salon)' },
      { label: 'Superficie', value: '185 m² habitables' },
      { label: 'Étage', value: '3ème étage avec ascenseur' },
      { label: 'Sécurité & Énergie', value: 'Gardiennage 24/7, Groupe électrogène' },
      { label: 'Documentation', value: 'Titre foncier individuel vérifié' },
    ],
    highlights: [
      'Emplacement calme et proche des axes commerciaux de Kipé',
      'Cuisine moderne aménagée avec plans de travail granit',
      'Parking privatif couvert en sous-sol',
    ],
    contactSubject: 'Demande d’information — Appartement Résidence Les Palmiers (Ref: EGT-IMM-01)',
  },
  {
    id: 'item-imm-02',
    slug: 'plateau-bureaux-affaires-kaloum',
    refCode: 'EGT-IMM-02',
    title: 'Plateau de Bureaux Corporatifs — Centre des Affaires',
    category: 'immobilier',
    categoryLabel: 'Immobilier & Aménagement',
    shortDescription:
      'Espace tertiaire modulable idéal pour siège d’entreprise, institution internationale ou cabinet conseil.',
    fullDescription:
      'Plateau de bureaux d’une superficie modulable situé au cœur économique et institutionnel de Kaloum. Le bâtiment dispose d’une double alimentation électrique secourue, d’un câblage réseau fibre optique, de salles de réunion partagées et d’un contrôle d’accès biométrique.',
    image: IMAGES.heroConakry,
    gallery: [
      IMAGES.heroConakry,
      IMAGES.realEstate,
    ],
    location: 'Conakry (Kaloum)',
    priceDisplay: 'Prix sur demande',
    status: 'sur-demande',
    statusLabel: 'Sur demande',
    featured: true,
    attributes: [
      { label: 'Type d’opération', value: 'Bail commercial / Location longue durée' },
      { label: 'Usage', value: 'Tertiaire & Siège d’entreprise' },
      { label: 'Superficie modulable', value: '350 m² à 700 m²' },
      { label: 'Connectivité', value: 'Fibre optique dédiée, baies de brassage' },
      { label: 'Commodités', value: 'Ascenseur de service, parkings réservés' },
    ],
    highlights: [
      'Proximité immédiate des banques, ministères et du port autonome',
      'Climatisation centrale à haut rendement énergétique',
      'Cloisonnement sur mesure réalisable sur plan',
    ],
    contactSubject: 'Demande de visite — Plateau de Bureaux Kaloum (Ref: EGT-IMM-02)',
  },
  {
    id: 'item-imm-03',
    slug: 'parcelles-viabilisees-sonfonia',
    refCode: 'EGT-IMM-03',
    title: 'Parcelles Viabilisées — Zone d’Aménagement Sonfonia',
    category: 'immobilier',
    categoryLabel: 'Immobilier & Aménagement',
    shortDescription:
      'Lots de terrains délimités et bornés avec voies d’accès tracées et réseau d’eau et d’électricité.',
    fullDescription:
      'E.GUITAP propose des parcelles viabilisées bénéficiant d’un plan de lotissement approuvé. Idéal pour construction de villas privées ou investissement locatif patrimonial en bordure des zones d’extension de l’agglomération de Conakry.',
    image: IMAGES.realEstate,
    gallery: [IMAGES.realEstate],
    location: 'Conakry (Sonfonia / Grand Conakry)',
    priceDisplay: 'Prix sur demande',
    status: 'disponible',
    statusLabel: 'Disponible',
    featured: false,
    attributes: [
      { label: 'Type d’opération', value: 'Vente de terrain' },
      { label: 'Dimensions des lots', value: '500 m² à 1 000 m²' },
      { label: 'Viabilisation', value: 'Voies d’accès ouvertes, caniveaux bétonnés' },
      { label: 'Situation juridique', value: 'Titre foncier global avec morcellement notarié' },
    ],
    highlights: [
      'Topographie plane facilitant les fondations',
      'Accompagnement pour l’obtention du permis de construire',
      'Zone en forte valorisation foncière',
    ],
    contactSubject: 'Information Parcelles Sonfonia (Ref: EGT-IMM-03)',
  },

  // 2. BTP & TRAVAUX PUBLICS
  {
    id: 'item-btp-01',
    slug: 'prestation-gros-oeuvre-immeubles',
    refCode: 'EGT-BTP-01',
    title: 'Prestation Gros Œuvre & Structure Béton Armé',
    category: 'btp',
    categoryLabel: 'BTP & Travaux Publics',
    shortDescription:
      'Réalisation d’ossatures béton armé, fondations spéciales et élévation de bâtiments industriels et tertiaires.',
    fullDescription:
      'Mobilisation de nos équipes de coffreurs, ferrailleurs et ingénieurs d’exécution pour la réalisation des structures porteuses de projets neufs. Contrôle rigoureux de la résistance des bétons et respect scrupuleux des normes parasismiques et géotechniques locales.',
    image: IMAGES.btpSite,
    gallery: [
      IMAGES.btpSite,
      IMAGES.heroConakry,
    ],
    location: 'Conakry & Toutes Régions de Guinée',
    priceDisplay: 'Étude & Devis sur cahier des charges',
    status: 'disponible',
    statusLabel: 'Disponible',
    featured: true,
    attributes: [
      { label: 'Type de prestation', value: 'Gros œuvre & Génie civil' },
      { label: 'Domaine d’intervention', value: 'Bâtiments R+1 à R+10, Entrepôts, Hangars' },
      { label: 'Équipements mobilisés', value: 'Centrales à béton, grues à tour, échafaudages certifiés' },
      { label: 'Encadrement', value: 'Ingénieur chef de projet & conducteurs de travaux' },
      { label: 'Garanties', value: 'Contrôle technique indépendant et assurance décennale' },
    ],
    highlights: [
      'Cadence d’exécution optimisée pour respect strict du calendrier',
      'Matériaux testés en laboratoire certifié (écrasement des éprouvettes)',
      'Respect rigoureux du plan d’hygiène et sécurité (HSE)',
    ],
    contactSubject: 'Consultation Gros Œuvre BTP (Ref: EGT-BTP-01)',
  },
  {
    id: 'item-btp-02',
    slug: 'travaux-terrassement-voirie-vrd',
    refCode: 'EGT-BTP-02',
    title: 'Travaux de Terrassement & Réseaux Divers (VRD)',
    category: 'btp',
    categoryLabel: 'BTP & Travaux Publics',
    shortDescription:
      'Décapage, nivellement, remblaiement compacté, assainissement et réalisation de voiries bitumées ou pavées.',
    fullDescription:
      'Intervention rapide avec notre flotte de pelles hydrauliques, niveleuses et compacteurs lourds pour préparer vos emprises foncières et bâtir des réseaux d’assainissement pluvial pérennes capables de résister aux fortes pluies tropicales.',
    image: IMAGES.btpSite,
    gallery: [IMAGES.btpSite],
    location: 'Zone industrielle de Matoto / Grand Conakry',
    priceDisplay: 'Sur devis quantitatif estimatif (DQE)',
    status: 'disponible',
    statusLabel: 'Disponible',
    featured: false,
    attributes: [
      { label: 'Type d’opération', value: 'Terrassement de masse & VRD' },
      { label: 'Parc engins', value: 'Pelles 20T-30T, niveleuses, compacteurs V5, camions bennes' },
      { label: 'Réseaux', value: 'Caniveaux béton armé, buses de drainage, dalots' },
      { label: 'Contrôle géotechnique', value: 'Essais Proctor et portance de sol' },
    ],
    highlights: [
      'Capacité de terrassement grand volume sur terrains rocheux ou latéritiques',
      'Assainissement dimensionné pour les précipitations équatoriales',
    ],
    contactSubject: 'Demande d’intervention Terrassement/VRD (Ref: EGT-BTP-02)',
  },
  {
    id: 'item-btp-03',
    slug: 'renovation-rehabilitation-structures',
    refCode: 'EGT-BTP-03',
    title: 'Réhabilitation & Rénovation Lourde d’Édifices',
    category: 'btp',
    categoryLabel: 'BTP & Travaux Publics',
    shortDescription:
      'Diagnostic structurel, confortement de fondations, réfection de façades et modernisation technique complète.',
    fullDescription:
      'E.GUITAP prend en charge la remise à neuf intégrale de bâtiments existants : reprise en sous-œuvre, mise aux normes électriques et incendie, étanchéité de toitures-terrasses et modernisation des espaces intérieurs.',
    image: IMAGES.heroConakry,
    gallery: [IMAGES.heroConakry],
    location: 'Conakry (Kaloum & Dixinn)',
    priceDisplay: 'Sur diagnostic et cahier des charges',
    status: 'sur-demande',
    statusLabel: 'Sur demande',
    featured: false,
    attributes: [
      { label: 'Type d’intervention', value: 'Rénovation technique et architecturale' },
      { label: 'Phase d’étude', value: 'Diagnostic structurel préliminaire' },
      { label: 'Corps d’état', value: 'Tous corps d’état (TCE) coordonnés' },
    ],
    highlights: [
      'Travaux possibles en site partiellement occupé',
      'Traitement de l’étanchéité garanti contre les infiltrations',
    ],
    contactSubject: 'Projet de rénovation institutionnelle (Ref: EGT-BTP-03)',
  },

  // 3. COMMERCE GÉNÉRAL
  {
    id: 'item-com-01',
    slug: 'ciment-haute-resistance-cpj',
    refCode: 'EGT-COM-01',
    title: 'Ciment Portland Certifié Haute Résistance (CPJ 42.5 & 32.5)',
    category: 'commerce',
    categoryLabel: 'Commerce Général',
    shortDescription:
      'Fourniture en gros et demi-gros de ciment pour béton armé, fondations et travaux de maçonnerie générale.',
    fullDescription:
      'Approvisionnement direct d’usines partenaires de renom. Sacs de 50 kg palettisés ou livraison en vrac par camions citernes pour centrales à béton. Conforme aux spécifications techniques nationales et internationales.',
    image: IMAGES.commerce,
    gallery: [IMAGES.commerce],
    location: 'Dépôts Conakry & Livraison sur chantiers',
    priceDisplay: 'Prix au tonnage sur demande',
    status: 'disponible',
    statusLabel: 'En stock régulier',
    featured: true,
    attributes: [
      { label: 'Catégorie', value: 'Matériaux de construction' },
      { label: 'Conditionnement', value: 'Sacs 50 kg plastifiés / Vrac citerne' },
      { label: 'Classes disponibles', value: 'CPJ 32.5 R & CPJ 42.5 R' },
      { label: 'Commande minimale', value: 'À partir de 10 tonnes' },
      { label: 'Logistique', value: 'Enlèvement dépôt ou livraison par semi-remorque' },
    ],
    highlights: [
      'Stocks garantis sans rupture pour chantiers en flux tendu',
      'Fiches techniques de laboratoire fournies à chaque lot',
      'Tarifs dégressifs pour volumes contractuels',
    ],
    contactSubject: 'Commande Ciment Haute Résistance (Ref: EGT-COM-01)',
  },
  {
    id: 'item-com-02',
    slug: 'fer-a-beton-haute-adherence',
    refCode: 'EGT-COM-02',
    title: 'Fer à Béton Haute Adhérence (FeE 500) — Tous Diamètres',
    category: 'commerce',
    categoryLabel: 'Commerce Général',
    shortDescription:
      'Barres d’acier crénelé de 12 mètres du Ø 6 au Ø 32 mm pour armatures et structures en béton armé.',
    fullDescription:
      'Acier nervuré FeE 500 certifié pour ouvrages d’art et édifices à étages. Grande ductilité, excellente soudabilité et résistance à la traction éprouvée. Conditionné en fardeaux standard avec étiquetage de traçabilité d’aciérie.',
    image: IMAGES.commerce,
    gallery: [IMAGES.commerce],
    location: 'Magasins Conakry (Matoto & Enta)',
    priceDisplay: 'Prix au tonnage selon cours matière',
    status: 'disponible',
    statusLabel: 'En stock régulier',
    featured: true,
    attributes: [
      { label: 'Diamètres disponibles', value: 'Ø 6, 8, 10, 12, 14, 16, 20, 25, 32 mm' },
      { label: 'Nuance d’acier', value: 'FeE 500 Haute Adhérence (HA)' },
      { label: 'Longueur', value: 'Barres droites de 12 mètres' },
      { label: 'Conditionnement', value: 'Fardeaux cerclés de 2 tonnes environ' },
    ],
    highlights: [
      'Acier neuf stocké sous abri couvert contre l’oxydation',
      'Certificat de conformité métallurgique d’origine',
      'Service de coupe et façonnage sur demande',
    ],
    contactSubject: 'Cotation Fer à Béton (Ref: EGT-COM-02)',
  },
  {
    id: 'item-com-03',
    slug: 'quincaillerie-outillage-industriel',
    refCode: 'EGT-COM-03',
    title: 'Lots de Quincaillerie & Outillage Électroportatif Pro',
    category: 'commerce',
    categoryLabel: 'Commerce Général',
    shortDescription:
      'Équipements pour artisans, entrepreneurs et ateliers : découpe, perforation, fixations et mesure laser.',
    fullDescription:
      'Distribution de marques réputées d’outillage électroportatif de niveau professionnel (meuleuses industrielles, perforateurs-burineurs, scies sur table) ainsi que tous consommables (disques diamant, chevilles métalliques lourdes).',
    image: IMAGES.commerce,
    gallery: [IMAGES.commerce],
    location: 'Showroom Commercial Conakry',
    priceDisplay: 'Catalogue tarifaire sur demande',
    status: 'disponible',
    statusLabel: 'Disponible',
    featured: false,
    attributes: [
      { label: 'Gamme', value: 'Outillage professionnel haute endurance' },
      { label: 'Alimentation', value: 'Filaire 220V et batterie Li-ion haute capacité' },
      { label: 'Garantie', value: 'Garantie constructeur avec pièces détachées' },
    ],
    highlights: [
      'Matériel adapté aux conditions climatiques chaudes et humides',
      'Pack complet de consommables disponible immédiatement',
    ],
    contactSubject: 'Renseignement Outillage Professionnel (Ref: EGT-COM-03)',
  },

  // 4. IMPORT-EXPORT & LOGISTIQUE
  {
    id: 'item-imp-01',
    slug: 'fret-maritime-fcl-lcl-conakry',
    refCode: 'EGT-IMP-01',
    title: 'Acheminement & Transit Maritime Conteneurisé (FCL / LCL)',
    category: 'import-export',
    categoryLabel: 'Import-Export & Logistique',
    shortDescription:
      'Organisation de fret maritime depuis l’Asie, l’Europe et les Amériques à destination du Port Autonome de Conakry.',
    fullDescription:
      'E.GUITAP orchestre vos approvisionnements internationaux maritimes complets (FCL 20ft/40ft/High Cube) ou en groupage (LCL). Nous prenons en charge la réservation d’espace navire, l’émission des connaissements maritimes (Bill of Lading) et le suivi en temps réel jusqu’à quai.',
    image: IMAGES.importExport,
    gallery: [IMAGES.importExport],
    location: 'Port Autonome de Conakry (PAC) — Liaisons Mondiales',
    priceDisplay: 'Cotation selon cotations fret maritime en vigueur',
    status: 'disponible',
    statusLabel: 'Opérationnel',
    featured: true,
    attributes: [
      { label: 'Incoterms gérés', value: 'CIF Conakry, FOB, CFR, DAP' },
      { label: 'Types de conteneurs', value: '20’ Dry, 40’ Dry, 40’ HC, Open Top, Flat Rack' },
      { label: 'Origines majeures', value: 'Chine, Turquie, Émirats Arabes Unis, Europe de l’Ouest' },
      { label: 'Documentation', value: 'Connaissement B/L, BESC / CTN Guinée, Certificats d’origine' },
    ],
    highlights: [
      'Partenariats avec les principales compagnies maritimes mondiales',
      'Suivi de cargaison et anticipation des formalités d’arrivée',
      'Assurance maritime ad valorem sur option',
    ],
    contactSubject: 'Demande de Fret Maritime (Ref: EGT-IMP-01)',
  },
  {
    id: 'item-imp-02',
    slug: 'dedouanement-transit-portuaire-pac',
    refCode: 'EGT-IMP-02',
    title: 'Prestation de Dédouanement & Transit Portuaire Accéléré',
    category: 'import-export',
    categoryLabel: 'Import-Export & Logistique',
    shortDescription:
      'Gestion complète des formalités douanières d’importation et d’exportation pour éviter surestaries et surestaries portuaires.',
    fullDescription:
      'Prise en charge de la déclaration en douane électronique (SYDONIA World), paiement des droits et taxes, passage aux scanners, obtention des bons à enlever (BAE) et acheminement routier sécurisé de vos marchandises depuis le terminal portuaire.',
    image: IMAGES.importExport,
    gallery: [IMAGES.importExport],
    location: 'Guichet Unique du Port de Conakry',
    priceDisplay: 'Barème agréé selon nomenclature douanière',
    status: 'disponible',
    statusLabel: 'Opérationnel',
    featured: true,
    attributes: [
      { label: 'Service', value: 'Commissionnaire agréé en douane & transit' },
      { label: 'Régimes douaniers', value: 'Mise à la consommation, admission temporaire, transit sous douane' },
      { label: 'Délai moyen d’enlèvement', value: 'Procédure accélérée selon complétude dossier' },
    ],
    highlights: [
      'Veille réglementaire et optimisation légale de la tarification douanière',
      'Équipe terrain présente en continu sur les quais du PAC',
    ],
    contactSubject: 'Mission de Transit & Dédouanement (Ref: EGT-IMP-02)',
  },
  {
    id: 'item-imp-03',
    slug: 'exportation-denrees-produits-locaux',
    refCode: 'EGT-IMP-03',
    title: 'Filière d’Exportation de Produits & Denrées Guinéennes',
    category: 'import-export',
    categoryLabel: 'Import-Export & Logistique',
    shortDescription:
      'Conditionnement et expédition internationale de denrées agricoles et ressources de la sous-région ouest-africaine.',
    fullDescription:
      'Accompagnement des producteurs et coopératives pour l’exportation de denrées conformes aux standards sanitaires et phytosanitaires internationaux : café, cacao, noix de cajou, et produits transformés vers les marchés européens et asiatiques.',
    image: IMAGES.importExport,
    gallery: [IMAGES.importExport],
    location: 'Conakry & Zones de production de l’intérieur',
    priceDisplay: 'Sur étude de cahier des charges d’export',
    status: 'sur-demande',
    statusLabel: 'Sur demande',
    featured: false,
    attributes: [
      { label: 'Type d’opération', value: 'Exportation de denrées & commodités' },
      { label: 'Contrôle qualité', value: 'Certificats phytosanitaires et fumigation certifiée' },
      { label: 'Emballage export', value: 'Sacs en toile de jute spéciale, conteneurs ventilés' },
    ],
    highlights: [
      'Valorisation du terroir et du savoir-faire guinéen',
      'Sécurisation des paiements internationaux (Crédits documentaires confirmés)',
    ],
    contactSubject: 'Opportunité Filière Exportation (Ref: EGT-IMP-03)',
  },
];
