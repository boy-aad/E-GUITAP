# E-GUITAP

Site institutionnel d'E-GUITAP (Entreprise Guinéenne de Terrassement, d'Aménagement et de Prestations) — BTP, immobilier et aménagement foncier, commerce général, import-export et projets fonciers, à Dubréka et Conakry (Guinée).

## Stack

React 19 · TypeScript 7 · Vite 8 · Tailwind CSS 4 · React Router 7 · Supabase (à venir)

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
├── app/router.tsx        routes (/, /entreprise, /activites, /projets, /projets/:slug, /contact…)
├── components/
│   ├── brand/            Logo officiel (charte v1.3), skyline, bande tricolore
│   ├── layout/           Header, Footer, Layout, navigation
│   └── ui/               Modal, Field, PageHero, Eyebrow, Seo
├── content/              contenus communiqués par l'entreprise, typés comme le futur schéma Supabase
├── features/             inquiry (demande de renseignements), projects, activities
├── lib/                  liens WhatsApp / e-mail / téléphone
└── pages/
```

## Règles de contenu

- Le nom s'écrit toujours **E-GUITAP** (trait d'union) ; la dénomination développée est réservée aux mentions légales.
- Aucune information non communiquée par l'entreprise (réalisations, chiffres, certifications, titres fonciers…).
- Les projets fonciers sont présentés avec leur superficie **annoncée** et l'avertissement `LAND_DISCLAIMER`.
- Pas de photo générique : visuels de la charte en attendant de vraies photos.

## Déploiement

Application monopage : l'hébergeur doit renvoyer `index.html` pour toutes les routes.

## Branches

- `main` : version stable, modifiée uniquement par pull request depuis `develop`.
- `develop` : branche de développement.
