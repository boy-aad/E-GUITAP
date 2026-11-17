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
├── components/
│   ├── brand/            Logo officiel (charte v1.3), skyline, bande tricolore
│   ├── layout/           Header (transparent sur l'accueil), MobileMenu, Footer, SocialLinks, Layout
│   └── ui/               design system : Button, Section/Container, Card/Badge, Reveal, CountUp,
│                         SmartImage, PageHero, Navigation (Breadcrumbs, Chips, SearchInput, EmptyState),
│                         Modal, Field, Eyebrow, Seo
├── config/env.ts         variables d'environnement validées
├── content/              types du contenu, libellés et avertissement juridique
├── data/                 lecture Supabase (siteContent.ts) et hook useSiteContent
├── features/             inquiry (demande de renseignements), projects, activities
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

Points clés :

- Les visiteurs ne lisent que le contenu publié ; ni coordonnées GPS ni statut documentaire des projets.
- Documents fonciers : table et bucket réservés à l'équipe (lecture) et aux admins (écriture).
- Un projet ne peut pas passer en « commercialisation ouverte » sans documents validés juridiquement (contrainte SQL).
- Rôles : `admin` (équipe, documents, suppressions) et `editeur` (contenu). Un compte n'a accès à l'administration que s'il figure dans `staff_profiles`.
- Types TypeScript : `src/types/database.ts`, à régénérer après chaque migration.

## Demandes de renseignements

Le formulaire appelle l'Edge Function `supabase/functions/submit-inquiry` (déployée avec `verify_jwt: false` : elle se protège elle-même) qui :

1. vérifie le captcha Cloudflare Turnstile ;
2. valide les champs et limite à 3 demandes par heure et par numéro ;
3. enregistre la demande dans `inquiries` (visible dans l'administration) ;
4. envoie la notification via Resend à l'e-mail publié dans les coordonnées.

Secrets à définir dans Supabase (Edge Functions → Secrets) : `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY` ; facultatifs : `RESEND_FROM`, `INQUIRY_NOTIFY_TO`, `ALLOWED_ORIGINS` (domaine de production).

## Règles de contenu

- Le nom s'écrit toujours **E-GUITAP** (trait d'union) ; la dénomination développée est réservée aux mentions légales.
- Aucune information non communiquée par l'entreprise (réalisations, chiffres, certifications, titres fonciers…).
- Les projets fonciers sont présentés avec leur superficie **annoncée** et l'avertissement `LAND_DISCLAIMER`.
- Visuels en attendant de vraies photos : illustrations de la charte (mention « Visuel d'illustration ») ou photos libres de droits Unsplash / Pexels (licence vérifiée, crédit enregistré, mention « Photo d'illustration »), jamais présentées comme des chantiers, terrains ou équipes d'E-GUITAP.
- Aucun prix ni budget affiché : les offres sont « Sur devis ».
- Règles complètes pour les agents de code : `CLAUDE.md`.

## Déploiement

Application monopage : l'hébergeur doit renvoyer `index.html` pour toutes les routes.

## Branches

- `main` : version stable, modifiée uniquement par pull request depuis `develop`.
- `develop` : branche de développement.
