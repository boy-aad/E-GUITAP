# CLAUDE.md — E-GUITAP

Site institutionnel + administration d'E-GUITAP (BTP, immobilier et aménagement foncier, commerce général, import-export — Dubréka / Conakry, Guinée).

Document de référence de l'itération en cours : [`docs/PRD-refonte-v2.md`](docs/PRD-refonte-v2.md). En cas de doute, le PRD et les règles ci-dessous priment sur toute initiative.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement (port 3000) |
| `npm run check` | `tsc --noEmit` (strict) + `oxlint` — doit rester vert |
| `npm run build` | Build de production (`dist/`) — doit rester vert, sans warning nouveau |

Avertissement connu (préexistant) : le chunk public dépasse 500 kB minifié (≈ 179 kB gzip) — à traiter, ne pas en ajouter d'autres.

Supabase : projet `ddfanksdrhwmdiisuvpb` (eu-west-1). Types générés dans `src/types/database.ts`.

## Architecture (résumé)

- **Stack** : React 19 · TypeScript 7 strict · Vite 8 · Tailwind CSS 4 · React Router 7 (data router) · Supabase (Postgres, Auth, Storage, Edge Functions) · icônes `lucide-react`.
- `src/app/router.tsx` : route racine `id: "root"`, loader unique `loadSiteContent` (`shouldRevalidate: () => false`) ; arbre `/admin` séparé (`src/admin/routes.tsx`, pages en lazy).
- `src/data/siteContent.ts` : toute la lecture publique ; filtres `publication = 'publie'` répétés dans chaque requête.
- `src/admin/` : `auth.ts` (`requireStaff`, `safeNext`), `AdminLayout.tsx`, `ui.tsx`, `format.ts`, `pages/`.
- `src/components/brand/` : `Logo.tsx` (charte v1.3 — **dessin intouchable**), `Skyline.tsx` (Skyline, TricolorBand, BrandPanel).
- `src/features/inquiry/` : modale de demande (InquiryProvider/useInquiry, InquiryForm, Turnstile, sujets `domain:` / `project:` / `general`).
- `supabase/migrations/` : 7 migrations appliquées ; `supabase/functions/submit-inquiry` (`verify_jwt: false`, se protège seule : origine, Turnstile, validation, 3 demandes/h/numéro, Resend).
- Autorisation SQL : `private.is_staff()`, `private.is_admin()` ; RLS sur toutes les tables.
- Charte : tokens dans `src/index.css` (marine `#102C50`, or `#C6A15B`, ivoire `#F5F1E8`, paper `#FAFAF7`, tricolore Guinée) ; Poppins (titres), Inter (texte), Lora italique (signatures). Signature : « Construire • Échanger • Développer ».

## Règles permanentes (non négociables)

### Contenu et juridique
1. **N'inventer aucune information** sur l'entreprise : ni réalisations, clients, chiffres, prix, délais, certifications, témoignages, partenaires, années d'expérience, effectifs, photos d'équipe. Seul le contenu présent en base ou fourni explicitement par le propriétaire est publié. Champ vide → la section ne s'affiche pas (jamais de « lorem » ni de placeholder visible).
2. Le nom s'écrit toujours **E-GUITAP** ; la dénomination développée est réservée aux mentions légales.
3. `LAND_DISCLAIMER` reste inchangé et accompagne toute présentation de projet foncier. Superficies toujours dites « annoncées ».
4. Jamais d'exposition publique de `approx_lat` / `approx_lng`, `document_status`, `land_project_documents`, notes internes.
5. Toute illustration générée : `kind = 'illustration'` + mention discrète « Visuel d'illustration ». Photos libres de droits autorisées (Unsplash / Pexels) : licence vérifiée, crédit enregistré, mention « Photo d'illustration », jamais présentées comme chantiers, terrains ou équipes d'E-GUITAP (PRD § 5.7).
6. **Aucun prix, tarif, fourchette ou budget** affiché ou demandé nulle part. Les offres portent « Sur devis ».
7. Interface 100 % en **français**, ton institutionnel, vouvoiement.

### Technique
8. **Pas de changement de stack** : ni Next.js, ni librairie UI lourde (MUI, Ant, Chakra, Bootstrap), ni CSS-in-JS. Tailwind 4 + tokens + composants maison.
9. **Nouvelle dépendance = justification écrite dans le commit** (taille, alternative maison écartée). Par défaut : animations CSS + `IntersectionObserver`, graphiques SVG maison.
10. **Migrations** : uniquement de nouveaux fichiers `supabase/migrations/AAAAMMJJHHMMSS_nom.sql`, jamais de modification d'une migration appliquée. Toute nouvelle table : RLS + « lecture publique du publié » / « lecture équipe » / écriture selon rôle via `(select private.is_staff())` / `(select private.is_admin())` ; index sur chaque clé étrangère ; trigger `updated_at` + audit si pertinent ; commentaires SQL en français.
11. **Avant d'appliquer une migration sur Supabase distant : montrer le SQL et attendre la validation du propriétaire.** Jamais de `reset`, de `drop` de données ni de suppression de bucket sans accord explicite.
12. Après chaque migration : régénérer `src/types/database.ts`, puis `npm run check` et `npm run build` sans erreur ni warning nouveau.
13. Aucune clé secrète (`service_role`, `sb_secret_…`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) côté navigateur. Opérations privilégiées = Edge Function qui vérifie le JWT **et** le rôle.
14. Code admin chargé en **lazy**, jamais importé par le site public. Loader public unique (`loadSiteContent`).
15. Ne pas toucher au commentaire HMR de `vite.config.ts`, ni au dessin du `Logo`.
16. Accessibilité : contrastes AA, focus visible, clavier, `aria-*` corrects, `prefers-reduced-motion` respecté partout : en mouvement réduit, **aucun déplacement** (ni translation, ni zoom, ni carrousel automatique). Exceptions validées par le propriétaire, car elles ne déplacent rien : les apparitions au défilement (`Reveal`) deviennent un simple fondu, et les compteurs de chiffres (`CountUp`) s'animent.
17. Performance (mobile guinéen) : WebP, `loading="lazy"` hors écran, dimensions explicites, image hero ≤ 250 Ko, aucune vidéo, pas de nouvelle police.
18. Qualité : aucun `any` ajouté, pas de code mort, composants < 300 lignes (découper sinon).

### Méthode
19. **Phase par phase** (PRD § 9). En fin de phase : `npm run check`, `npm run build`, vérification visuelle 375 / 768 / 1280 px (+ clavier, reduced-motion), **un commit** en français au format conventionnel (`feat(catalogue): …`), compte rendu (fait / reste / points à valider), puis **arrêt** jusqu'au feu vert.
20. Jamais de commit sur `main`, jamais de `push --force`, jamais de réécriture d'historique. Travail sur `develop`.
21. Exigence contradictoire ou irréalisable → **poser la question**, ne pas improviser. Questions ouvertes du PRD § 10 : valeur par défaut tant que le propriétaire n'a pas répondu.
22. Mettre à jour `README.md` (structure, migrations, Edge Functions, secrets) à chaque phase qui les modifie.
