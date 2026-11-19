# E-GUITAP

Site institutionnel d'E-GUITAP (Entreprise Guinéenne de Terrassement, d'Aménagement et de Prestations) — BTP, immobilier et aménagement foncier, commerce général, import-export et projets fonciers, à Dubréka et Conakry (Guinée).

## Stack

React 19 · TypeScript 7 · Vite 8 · Tailwind CSS 4 · React Router 7 · Supabase

## Démarrer en local

Prérequis : Node.js 22+

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs
npm run dev                  # http://localhost:3000
```

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualiser le build |
| `npm run typecheck` | Vérification TypeScript (mode strict) |
| `npm run lint` | Analyse du code (oxlint : React, hooks, accessibilité) |
| `npm run check` | typecheck + lint |

## Structure

```
src/
├── app/router.tsx        routes ; le loader racine charge tout le contenu depuis Supabase
├── admin/                administration (chargée à la demande, jamais importée par le site public)
│   ├── AdminLayout.tsx   coque : barre latérale repliable, barre supérieure, tiroir mobile, Ctrl/⌘ + K
│   ├── shell/            Sidebar, Topbar (fil d'Ariane, compte), CommandPalette, navigation
│   ├── ui/               kit : DataTable, Tabs (useTabs), StatCard, FilterTabs, SearchField, FormSection, PublishSwitch,
│   │                     ConfirmDialog (useConfirm), Toast, StickyActionBar + useUnsavedChanges
│   │                     charts (StackedColumns, BarList : graphiques maison, sans dépendance)
│   ├── media/            médiathèque : conversion WebP dans le navigateur (1920 + 640 px, 5 Mo max),
│   │                     Uploader (glisser-déposer, texte alternatif obligatoire), MediaPickerDialog, ImagePicker
│   └── pages/            Tableau de bord, Demandes, Offres, Catégories, Page d'accueil (slides), Entreprise,
│                         Coordonnées et réseaux, Textes des pages, Médiathèque, Projets fonciers
│                         (sous-dossiers : données et sections ; content/ pour les pages « Contenus » ;
│                         project/ : fiche en onglets, galerie, jalons, documents fonciers en bucket privé
│                         consultés par lien signé de 60 s, réservés aux administrateurs)
├── components/
│   ├── brand/            Logo officiel (charte v1.3), skyline, bande tricolore
│   ├── layout/           Header (transparent sur l'accueil), MobileMenu, Footer, SocialLinks, Layout
│   └── ui/               design system : Button, Section/Container, Card/Badge, Reveal, CountUp,
│                         SmartImage, PageHero, Navigation (Breadcrumbs, Chips, SearchInput, EmptyState),
│                         Modal, Field, Eyebrow, Seo
├── config/env.ts         variables d'environnement validées
├── content/              types du contenu, libellés, avertissement juridique, photos par défaut (stockPhotos.ts)
├── data/                 lecture Supabase (siteContent.ts) et hook useSiteContent
├── features/             offers (carte, filtres, image par défaut), home (hero en carrousel, scène animée, chiffres clés, bandeau), inquiry, projects, activities
├── lib/                  client Supabase, liens WhatsApp / e-mail / téléphone, médias, réseaux sociaux, motion
├── types/database.ts     types générés depuis le schéma
└── pages/
```

## Base de données (Supabase)

Migrations versionnées dans `supabase/migrations/` (appliquées dans l'ordre) :

| Migration | Contenu |
|---|---|
| `…_schema` | types énumérés, tables, index, contraintes, journal d'audit, `updated_at` |
| `…_rls` | RLS sur toutes les tables, droits minimaux (`anon` : lecture du contenu publié) |
| `…_storage` | buckets `public-media` (public) et `land-documents` (**privé**) |
| `…_seed_content` | contenu communiqué par l'entreprise (identique au site) |
| `…_rls_split_public_reads` | règles de lecture séparées visiteur / équipe |
| `…_private_helpers` | `is_staff()`, `is_admin()`… déplacées dans le schéma `private` (hors API) |
| `…_inquiry_notifications` | suivi de la notification e-mail des demandes |
| `…_catalog_offers` | catalogue : `slug`, `summary`, `cover_media_id`, `is_featured`, `quote_enabled` sur `activity_services` |
| `…_inquiry_quote_type` | type de demande `demande_devis` |
| `…_inquiry_request_details` | précisions d'un devis (`request_details` : lieu, délai, quantité ; aucun prix) |
| `…_offer_descriptions` | résumé et description des 21 offres (modifiables dans l'administration, menu « Offres ») |
| `…_staff_directory` | l'équipe lit l'annuaire (noms, rôles) pour l'assignation des demandes ; écriture inchangée (admins) |
| `…_inquiry_events` | historique des demandes (statut, assignation) alimenté par déclencheur, sans données personnelles ; lu par l'équipe |
| `…_admin_only_deletes` | suppressions réservées aux admins (offres, catégories, valeurs, coordonnées, slides, textes, médias, fichiers `public-media`) ; une catégorie contenant des offres ne peut pas être supprimée |
| `…_media_variants` | médias : `variants` (déclinaisons par largeur), `bytes`, `updated_at` + déclencheurs `updated_at` et journal |
| `…_hero_and_company` | point focal des slides (`focal_x`, `focal_y`), position publique du siège (`office_lat`, `office_lng`, carte non affichée tant que Q3 n'est pas tranchée), réseaux sociaux en https obligatoire, journal d'activité sur slides, valeurs et textes |

Note : sur le projet distant, ces quatre migrations sont enregistrées avec l'horodatage de leur application (contenu identique aux fichiers).

Points clés :

- Les visiteurs ne lisent que le contenu publié ; ni coordonnées GPS ni statut documentaire des projets.
- Documents fonciers : table et bucket réservés à l'équipe (lecture) et aux admins (écriture).
- Un projet ne peut pas passer en « commercialisation ouverte » sans documents validés juridiquement (contrainte SQL).
- Rôles : `admin` (équipe, documents, suppressions) et `editeur` (contenu). Les éditeurs créent et modifient ; seuls les admins suppriment (règles RLS), sauf les objectifs, jalons et médias d'un projet, qui font partie de sa modification. Un compte n'a accès à l'administration que s'il figure dans `staff_profiles`.
- Types TypeScript : `src/types/database.ts`, à régénérer après chaque migration.

## Catalogue d'offres

- Pages `/offres` (filtres par catégorie, disponibilité et recherche dans l'URL) et `/offres/:slug`.
- Image d'une offre : média téléversé, sinon illustration SVG `public/assets/illustrations/offres/<slug>.svg`,
  sinon celle de la catégorie, sinon `defaut.svg` (mention « Visuel d'illustration »).
- Illustrations régénérables : `python scripts/generate-offer-illustrations.py public/assets/illustrations`
  (met aussi à jour `src/content/offerIllustrations.ts`).

## Demandes de renseignements

Le formulaire appelle l'Edge Function `supabase/functions/submit-inquiry` (déployée avec `verify_jwt: false` : elle se protège elle-même) qui :

1. vérifie le captcha Cloudflare Turnstile ;
   (un sujet `offer:<slug>` crée une demande de devis : `type = demande_devis`, `service_id`, `request_details`, e-mail « Demande de devis — <offre> ») ;
2. valide les champs et limite à 3 demandes par heure et par numéro ;
3. enregistre la demande dans `inquiries` (visible dans l'administration) ;
4. envoie la notification via Resend à l'e-mail publié dans les coordonnées.

Secrets à définir dans Supabase (Edge Functions → Secrets) : `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY` ; facultatifs : `RESEND_FROM`, `INQUIRY_NOTIFY_TO`, `ALLOWED_ORIGINS` (domaine de production).

## Règles de contenu

- Le nom s'écrit toujours **E-GUITAP** (trait d'union) ; la dénomination développée est réservée aux mentions légales.
- Aucune information non communiquée par l'entreprise (réalisations, chiffres, certifications, titres fonciers…).
- Les projets fonciers sont présentés avec leur superficie **annoncée** et l'avertissement `LAND_DISCLAIMER`.
- Visuels en attendant de vraies photos : illustrations de la charte (mention « Visuel d'illustration ») ou photos libres de droits Unsplash / Pexels (licence vérifiée, crédit enregistré, mention « Photo d'illustration »), jamais présentées comme des chantiers, terrains ou équipes d'E-GUITAP.
- Projets fonciers : photos réelles communiquées par l'entreprise (`public/assets/projets/`), sinon illustration générée du projet (`public/assets/illustrations/projets/`, mention « Visuel d'illustration ») ; correspondances dans `src/content/projectImages.ts`.
- Photos d'illustration actuelles : `public/assets/photos/` (WebP), crédits dans `docs/CREDITS-PHOTOS.md` et dans les mentions légales. Une image téléversée en base reste prioritaire.
- Aucun prix ni budget affiché : les offres sont « Sur devis ».
- Règles complètes pour les agents de code : `CLAUDE.md`.

## Déploiement

Application monopage : l'hébergeur doit renvoyer `index.html` pour toutes les routes.

## Référencement (SEO)

- `VITE_SITE_URL` (adresse publique, sans « / » final) : liens canoniques, balises de partage et `sitemap.xml`. À définir sur l'hébergeur de production ; sans elle, l'adresse du navigateur est utilisée et aucun sitemap n'est généré.
- `npm run build` lance ensuite `scripts/generate-sitemap.mjs` (`postbuild`) : `dist/sitemap.xml` (pages fixes + offres et projets publiés, lus avec la clé publique) et ligne `Sitemap:` ajoutée à `dist/robots.txt`.
- `public/robots.txt` : `/admin` exclu. Image de partage par défaut : `public/og/default.png` (1200 × 630, dérivée du logo).
- Données structurées : `Organization` + `LocalBusiness` sur l'accueil (champs publiés uniquement), `BreadcrumbList` sur toutes les pages à bannière ; la page 404 est en `noindex`.

## Branches

- `main` : version stable, modifiée uniquement par pull request depuis `develop`.
- `develop` : branche de développement.
