# PRD — E-GUITAP v2 : refonte du design, catalogue d'offres, hero immersif et administration professionnelle

> **Document de référence pour Claude Code.** À lire en entier avant toute modification.
> En cas de doute, ce document et les règles permanentes (§ 3) priment sur toute initiative.
> Version 1.0 — 17/11/2026 — branche de travail : `develop`.

---

## 1. Contexte et état actuel (à ne pas casser)

E-GUITAP est une entreprise guinéenne multisectorielle (BTP, immobilier et aménagement foncier, commerce général, import-export) basée à Dubréka et Conakry. Le site est une SPA **React 19 · TypeScript 7 (strict) · Vite 8 · Tailwind CSS 4 · React Router 7 (data router) · Supabase** (Postgres + Auth + Storage + Edge Functions).

Historique git déjà livré sur `develop` (à respecter, ne pas réécrire) :
`phase 0` assainissement → `étape A` recadrage du contenu → `étape B` schéma Supabase/RLS/stockage/seed → `étape C` lecture du contenu depuis Supabase → `étape D` demandes + Turnstile + Resend → `étape E1-E2` admin (connexion, demandes, projets fonciers).

### 1.1 Architecture existante

```
src/
├── app/router.tsx            createBrowserRouter ; route racine id "root" + loader loadSiteContent
│                             (shouldRevalidate: () => false) ; arbre /admin séparé (adminRoutes)
├── admin/                    administration, pages chargées en lazy (Component + loader + action)
│   ├── auth.ts               requireStaff() : session + staff_profiles actif, safeNext()
│   ├── AdminLayout.tsx       barre latérale (items "bientôt" : Activités, Entreprise, Médias, Équipe)
│   ├── ui.tsx / format.ts    AdminPageHeader, Badge, Notice, classes boutons ; libellés, slugify, friendlyDbError
│   └── pages/                Dashboard, Inquiries, InquiryDetail, Login, Projects, ProjectEdit
├── components/brand/         Logo officiel (charte v1.3) — NE PAS MODIFIER le dessin ; Skyline, TricolorBand, BrandPanel
├── components/layout/        Header, Footer, Layout (bouton WhatsApp flottant), navigation.ts, RootStatus
├── components/ui/            Modal, Field (Input/Select/Textarea), PageHero, Eyebrow, Seo, SmartLink
├── config/env.ts             variables VITE_* validées (refuse une clé sb_secret_)
├── content/                  types.ts (SiteContent), landProjects.ts (LAND_DISCLAIMER, libellés)
├── data/                     siteContent.ts (lecture publique, filtres publication répétés), useSiteContent
├── features/                 inquiry (InquiryProvider/useInquiry → modale + InquiryForm + Turnstile), projects, activities
├── lib/                      supabase.ts, contact.ts (whatsappUrl, mailtoUrl, telUrl)
└── types/database.ts         types générés — à régénérer après chaque migration
supabase/
├── migrations/               7 migrations appliquées (schema, rls, storage, seed, rls_split, private_helpers, inquiry_notifications)
└── functions/submit-inquiry  Edge Function (verify_jwt: false, se protège seule) : origine, Turnstile, validation,
                              3 demandes/h/numéro, insert service_role, notification Resend
```

### 1.2 Modèle de données existant (extraits utiles)

- `company_profile` (ligne unique), `company_values`, `company_contacts` (kind : phone | whatsapp | email | address | **social** — social non encore exploité).
- `media` (path dans le bucket `public-media`, kind : photo_reelle | illustration | plan | logo, alt, credit, width, height).
- `activity_domains` (slug, letter, title, short_title, summary, description, availability, publication, sort_order, **cover_media_id**).
- `activity_services` (domain_id, title, description, availability, publication, sort_order) — 21 prestations réelles en base.
- `hero_slides` (eyebrow, title, title_highlight, subtitle, show_signature, CTA ×2, **background_media_id**, is_active, sort_order).
- `content_blocks` (clés fermées : home.presentation, home.cta, company.presentation, projects.intro, contact.intro).
- `land_projects` + objectives, milestones, **land_project_media** (is_cover), land_project_documents (privé). Contrainte : pas de `commercialisation_ouverte` sans `valide_juridiquement`.
- `inquiries` (type : contact | renseignement_activite | renseignement_projet ; status ; domain_id, **service_id**, land_project_id ; notified_at, notification_error).
- `staff_profiles` (role : admin | editeur, is_active), `audit_log` (lecture admin).
- Fonctions d'autorisation `private.is_staff()`, `private.is_admin()` (schéma non exposé). RLS active partout : `anon` lit uniquement le publié ; équipe = écriture contenu ; admin = suppressions, équipe, documents.
- Buckets : `public-media` (public, 5 Mo, images) et `land-documents` (privé, 20 Mo).

### 1.3 Charte graphique (tokens `src/index.css`, à conserver)

Marine `#102C50` (dark `#0A1C33`, light `#173A66`) · Or `#C6A15B` (hover `#B59048`, light `#E8D7B0`) · Ivoire `#F5F1E8` · Paper `#FAFAF7` · Slate text `#44505F` · Tricolore Guinée (rouge `#CE1126`, jaune `#FCD116`, vert `#009460`).
Typographies : **Poppins** (titres), **Inter** (texte), **Lora italique** (signatures). Signature de marque : « Construire • Échanger • Développer ».

---

## 2. Objectifs de la v2

| # | Objectif | Résultat attendu |
|---|---|---|
| O1 | **Design professionnel** du site public | Rendu d'une entreprise institutionnelle BTP/immobilier haut de gamme : rythme, profondeur, images, micro-animations, cohérence parfaite. |
| O2 | **Catalogue d'offres** | Page `/offres` en cartes (image, titre, description, catégorie, bouton « Demander un devis »), filtres + recherche, fiche détail. |
| O3 | **Visuel par défaut pour chaque offre** | Une illustration originale générée (SVG) par offre, affichée tant qu'aucune image réelle n'est téléversée. |
| O4 | **Hero immersif** | Fond image (effet Ken Burns) ou animation de marque, carrousel des slides actives, comme les sites d'agences immobilières / de voyage. |
| O5 | **Administration professionnelle** | Back-office de niveau entreprise : navigation claire, tableau de bord riche, tables filtrables, formulaires structurés, médiathèque, gestion de tout le contenu, de l'équipe et du journal. |

Non-objectifs (hors périmètre de cette itération) : paiement en ligne, espace client, multilingue, blog, vidéo de fond, migration de framework, refonte du logo.

---

## 3. Règles permanentes (NON NÉGOCIABLES)

À recopier dans un fichier `CLAUDE.md` à la racine dès la phase 0.

### 3.1 Contenu et juridique
1. **N'inventer aucune information** sur l'entreprise : pas de réalisations, clients, chiffres, prix, délais, certifications, témoignages, partenaires, années d'expérience, effectifs, photos d'équipe. Seuls les contenus présents en base ou fournis explicitement par le propriétaire sont publiés. Un champ vide → la section ne s'affiche pas (jamais de texte « lorem » ou de placeholder visible).
2. Le nom s'écrit toujours **E-GUITAP** ; la dénomination développée est réservée aux mentions légales.
3. `LAND_DISCLAIMER` reste inchangé et accompagne toute présentation de projet foncier. Superficies toujours dites « annoncées ».
4. Jamais d'exposition publique de `approx_lat/approx_lng`, `document_status`, `land_project_documents`, notes internes.
5. Toute illustration générée est marquée `kind = 'illustration'` et affiche la mention discrète « Visuel d'illustration ». **Les photos de banques d'images libres de droits sont autorisées** (décision Q1), sous les conditions du § 5.7 : licence vérifiée, crédit enregistré, mention « Photo d'illustration », jamais présentées comme des chantiers, terrains ou équipes d'E-GUITAP. Mettre à jour en conséquence la règle « Pas de photo générique » du `README.md`.
5 bis. **Aucun prix, tarif, fourchette ou budget indicatif** n'est affiché ni demandé nulle part (décision Q2). Les offres portent la mention « Sur devis ».
6. Interface 100 % en **français**, ton institutionnel, vouvoiement.

### 3.2 Technique
7. **Pas de changement de stack** : pas de Next.js, pas de librairie UI lourde (MUI, Ant, Chakra, Bootstrap), pas de CSS-in-JS. Tailwind 4 + tokens de `index.css` + composants maison.
8. **Nouvelle dépendance = justification écrite** dans le commit (taille, alternative maison écartée). Autorisées sans justification supplémentaire : aucune. Par défaut : animations en CSS + `IntersectionObserver`, graphiques en SVG maison.
9. **Migrations** : uniquement de **nouveaux** fichiers `supabase/migrations/AAAAMMJJHHMMSS_nom.sql`. Ne jamais modifier une migration déjà appliquée. Toute nouvelle table : RLS activée + règles « lecture publique du publié » / « lecture équipe » / écriture selon rôle, en réutilisant `(select private.is_staff())` / `(select private.is_admin())`. Index sur chaque clé étrangère. Trigger `updated_at` + audit si pertinent.
10. **Avant d'appliquer une migration** sur le projet Supabase distant : montrer le SQL et attendre la validation du propriétaire. Jamais de `reset`, `drop` de données ou de suppression de bucket sans accord explicite.
11. Après chaque migration : régénérer `src/types/database.ts`, puis `npm run check` et `npm run build` doivent passer **sans erreur ni warning nouveau**.
12. Aucune clé secrète (`service_role`, `sb_secret_…`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) côté navigateur. Les opérations privilégiées passent par une Edge Function qui vérifie le JWT **et** le rôle.
13. Le code admin reste chargé en **lazy** (jamais importé par le site public). Le loader public reste unique (`loadSiteContent`), avec filtres `publication = 'publie'` répétés côté requête.
14. Ne pas toucher au commentaire HMR de `vite.config.ts`, ni au dessin du `Logo`.
15. Design et mouvement selon Apple Design (skill `apple-design`, détail dans la règle 16 de `CLAUDE.md`), dans la limite des règles sur la stack, les dépendances et la performance. Accessibilité : contrastes AA, focus visible, navigation clavier, `aria-*` corrects, `prefers-reduced-motion` respecté partout (aucun déplacement si activé, fondus à la place) ; exceptions validées par le propriétaire, sans déplacement : apparitions en simple fondu et compteurs de chiffres clés. `prefers-reduced-transparency` et `prefers-contrast` également respectés.
16. Performance (réseau mobile guinéen) : images en WebP, `loading="lazy"` hors écran, dimensions explicites (pas de CLS), image hero ≤ 250 Ko, aucune vidéo, polices déjà chargées réutilisées.

### 3.3 Méthode de travail
17. Travailler **phase par phase** (§ 9). À la fin de chaque phase : `npm run check`, `npm run build`, vérification visuelle en 375 px / 768 px / 1280 px, puis **un commit** en français au format conventionnel (`feat(catalogue): …`), et **s'arrêter** pour un compte rendu (fait / reste / points à valider). Ne pas enchaîner la phase suivante sans accord.
18. Jamais de commit sur `main`, jamais de `push --force`, jamais de réécriture d'historique.
19. Si une exigence de ce PRD semble contradictoire ou irréalisable : **poser la question** au lieu d'improviser.
20. Mettre à jour `README.md` (structure, migrations, Edge Functions, secrets) à chaque phase qui les modifie.

---

## 4. Direction artistique (site public)

**Positionnement visuel :** institutionnel premium, solide et rassurant (BTP/foncier), avec la chaleur de l'or et une touche guinéenne (bande tricolore). Références d'intention : sites d'agences immobilières haut de gamme et de groupes BTP africains — grands visuels, beaucoup d'air, typographie affirmée, animations sobres.

### 4.1 Principes
- **Grille** : conteneur `max-w-7xl`, sections espacées (`py-20 lg:py-28`), alternance fonds paper / blanc / ivoire / marine pour rythmer la lecture.
- **Typographie** : échelle claire (display 56–72 px desktop pour le hero, H2 36–44 px, H3 20–24 px), titres Poppins 700 avec `tracking-tight`, eyebrows Poppins 600 majuscules espacées en or, texte Inter 16–18 px `leading-relaxed`.
- **Profondeur** : cartes avec bordure fine + ombre douce au survol (`shadow-[0_20px_50px_-20px_rgba(16,44,80,0.35)]`), coins `rounded-xl`, dégradés marine subtils, filets or.
- **Mouvement** : apparition au défilement (fade + translate 16 px, 500 ms, échelonnée), survol des cartes (image zoom 1.05, élévation), compteurs animés pour les chiffres clés (au défilement), soulignements or animés sur les liens. Si `prefers-reduced-motion` : aucun déplacement ; les apparitions deviennent un simple fondu et les compteurs s'animent (exceptions validées).
- **Iconographie** : `lucide-react` uniquement, trait 1.5–2, cohérent.
- **Images** : ratio fixe par usage (cartes 4:3, hero 16:9 plein écran, bannières 21:9), overlay dégradé marine pour la lisibilité du texte.

### 4.2 Composants communs à créer (`src/components/ui/`)
`Container`, `Section` (titre + eyebrow + intro + variante de fond), `Button` (variants : primary or, secondary contour, ghost, dark ; tailles ; icône), `Card`, `Badge`, `Reveal` (apparition au défilement, respecte reduced-motion), `CountUp`, `SmartImage` (gère `media` → URL publique, `srcSet` deux tailles, ratio, lazy, fallback), `EmptyState`, `Breadcrumbs`, `Tabs`/`Chips` (filtres), `SearchInput`.
Les boutons existants dispersés en classes Tailwind sont remplacés par `Button`.

### 4.3 Header et footer
- **Header** : transparent au-dessus du hero de l'accueil (logo version claire), devient opaque blanc + ombre au défilement (> 40 px) ; sur les autres pages, opaque dès le départ. Navigation : Accueil · L'entreprise · Nos activités · **Nos offres** · Nos projets · Contact. Bouton or « Demander un devis » à droite. Menu mobile plein écran animé. Lien actif souligné or.
- **Footer** : 4 colonnes (marque + signature + réseaux sociaux ; navigation ; offres par catégorie ; contact), bande tricolore, mentions légales / confidentialité, © année courante. Réseaux sociaux = `company_contacts.kind = 'social'` (icône déduite du domaine de l'URL ; masqué si aucun).

---

## 5. Exigences fonctionnelles — site public

### 5.1 Hero immersif (accueil) — O4

**Comportement**
- Hauteur `min-h-[88svh]` desktop, `min-h-[80svh]` mobile ; contenu aligné à gauche, centré verticalement.
- **Carrousel** de toutes les `hero_slides` actives (ordre `sort_order`) : défilement automatique toutes les 7 s, fondu enchaîné 1 s, pause au survol / focus / onglet masqué, flèches + puces accessibles (`aria-roledescription="carousel"`, `aria-live="polite"` désactivé en lecture auto). Une seule slide → pas de contrôles.
- **Fond, par ordre de priorité** :
  1. `background_media_id` renseigné → image plein cadre `object-cover` avec **effet Ken Burns** (zoom 1.0 → 1.08 + léger déplacement sur 12 s), overlay dégradé `from-marine-dark/90 via-marine/60 to-transparent` (gauche → droite) + vignette basse ;
  2. sinon → **photo par défaut de la slide** issue de la sélection de photos libres de droits du § 5.7 (une photo différente par slide, mêmes effets et overlay que ci-dessus) ;
  3. en dernier recours (photo indisponible, échec de chargement) → **scène animée de marque** (composant `HeroScene`, SVG + CSS, aucune dépendance) : skyline en 3 plans avec parallaxe lente, tracé animé de parcelles/lotissement en filets or (stroke-dashoffset), dégradé marine qui « respire », particules de poussière dorée très discrètes. Poids < 20 Ko, 60 fps, aucune requête réseau.
- Texte : eyebrow, titre (deuxième ligne `title_highlight` en or), sous-titre, signature Lora, 2 CTA (le principal ouvre la demande de devis si `href = '#devis'`), puis **indicateur de défilement** animé.
- Sous le hero : **bandeau de chiffres clés** en surimpression (carte blanche qui chevauche le hero de 50 %) : nombre de domaines, d'offres, de projets, superficie totale annoncée — **calculés depuis la base uniquement**.
- `prefers-reduced-motion` : première slide statique, pas de Ken Burns ni de parallaxe.
- Performance : image de la 1re slide en `fetchpriority="high"`, les suivantes en lazy ; LCP < 2,5 s en 4G simulée.

**Pages intérieures** : `PageHero` évolue en bannière 21:9 réutilisant le même principe (image si disponible, sinon scène de marque statique), avec fil d'Ariane.

### 5.2 Catalogue d'offres — O2

**Modèle** : une **offre** = une prestation existante de `activity_services`, enrichie ; sa **catégorie** = son `activity_domain`. On n'introduit pas de table parallèle (évite la double saisie des 21 prestations réelles).

**Page `/offres`**
- En-tête : `PageHero` « Nos offres » + intro.
- **Barre de filtres** collante : puces de catégories (Toutes · BTP · Immobilier et foncier · Commerce général · Import-export, avec compteurs), champ de recherche (titre + résumé, insensible aux accents), filtre disponibilité (Opérationnelle / En développement). État des filtres reflété dans l'URL (`?categorie=btp&q=route`) pour partage et retour arrière.
- **Grille de cartes** responsive (1 / 2 / 3 colonnes, 4 en ≥ 1536 px). Chaque **carte** contient :
  - **image** 4:3 (`SmartImage` : média réel sinon illustration par défaut, § 5.3) avec badge catégorie en surimpression et mention « Visuel d'illustration » si applicable ;
  - **titre** (2 lignes max) ;
  - **description courte** (`summary`, 3 lignes max, `line-clamp`) ;
  - badge « En développement » si `availability = 'en_developpement'` ;
  - bouton principal **« Demander un devis »** (ouvre la modale de demande présélectionnée sur l'offre) + lien secondaire « En savoir plus » vers la fiche.
- Offres mises en avant (`is_featured`) en premier ; tri ensuite par catégorie puis `sort_order`.
- État vide soigné (« Aucune offre ne correspond à votre recherche » + réinitialiser).

**Fiche `/offres/:slug`**
- Fil d'Ariane, image large, catégorie, titre, description complète (`description`, paragraphes), points clés éventuels, encart latéral collant « Demander un devis » + WhatsApp + téléphone, offres de la même catégorie (3 cartes), SEO propre (title/description/OG image = image de l'offre).
- 404 dédiée si slug inconnu ou offre non publiée.

**Intégrations**
- Accueil : section « Nos offres phares » (6 cartes `is_featured`, sinon 6 premières) + lien « Voir tout le catalogue ».
- Page Activités : chaque domaine liste ses offres en mini-cartes cliquables et un lien « Voir les offres BTP » → `/offres?categorie=btp`.

### 5.3 Visuels par défaut générés — O3

> Claude Code ne génère pas de photographies : il **dessine des illustrations vectorielles (SVG) originales**. C'est voulu : légères, nettes à toutes les tailles, cohérentes avec la charte, et clairement identifiées comme illustrations.

- **Une illustration par offre existante** (21) + **une par catégorie** (4) + **une générique** : `public/assets/illustrations/offres/<slug>.svg`, `…/categories/<slug-domaine>.svg`, `…/defaut.svg`.
- **Style imposé, identique pour toutes** : illustration plate/isométrique légère, viewBox `0 0 800 600`, palette exclusivement charte (marine, marine-light, or, or-light, ivoire, + accents tricolores ≤ 5 %), fond ivoire ou marine dégradé, sujet central reconnaissable de l'offre (ex. pelleteuse et remblai pour « Terrassement et remblayage », route qui serpente pour « Ouverture de routes », parcelles bornées pour « Lotissement », conteneurs et navire pour « Import-export », camion-benne de latérite, grue et bâtiment pour « Construction », poignée de main + plan pour « Accompagnement des investisseurs »…), **aucun texte, aucun logo de marque tierce, aucun visage réaliste**, silhouettes humaines stylisées autorisées. Poids ≤ 15 Ko chacune (SVG optimisé, pas d'image raster embarquée).
- Planche de contrôle : une page de dev non routée en production (`/admin/outils/illustrations`, admin uniquement) affichant toutes les illustrations côte à côte pour valider la cohérence.
- **Résolution de l'image d'une carte** (`resolveOfferImage`) : `cover_media_id` (média réel) → `/assets/illustrations/offres/<slug>.svg` s'il existe (manifeste généré à la compilation via `import.meta.glob`) → illustration de la catégorie → `defaut.svg`. Une offre créée plus tard dans l'admin reçoit donc automatiquement le visuel de sa catégorie jusqu'au téléversement d'une vraie image.
- Même mécanisme pour les **projets fonciers** (`land_project_media.is_cover` → illustration « parcelles/paysage » propre à chaque projet) et les **domaines** (`cover_media_id`).

### 5.4 Demande de devis

- La modale existante (`InquiryProvider` / `InquiryForm`) est réutilisée et étendue : nouveau sujet `offer:<slug>` ; quand l'utilisateur vient d'un bouton « Demander un devis », le titre de la modale devient « Demande de devis », l'offre est présélectionnée (liste groupée par catégorie) et trois champs facultatifs apparaissent : **lieu du chantier / de livraison**, **délai souhaité** (select : urgent, < 1 mois, 1–3 mois, > 3 mois, à définir), **quantité ou surface estimée** (texte libre). Pas de champ prix/budget obligatoire.
- Turnstile, pot de miel, consentement, limite 3/h/numéro : **inchangés**.
- Edge Function `submit-inquiry` : accepte `offer:<slug>` → `type = 'demande_devis'`, renseigne `service_id` et `domain_id`, stocke les champs facultatifs dans `request_details` (jsonb validé : clés autorisées uniquement, 300 caractères max chacune), objet d'e-mail « Demande de devis — <offre> ». Redéployer avec `verify_jwt: false` (inchangé).
- Écran de succès inchangé dans l'esprit, avec rappel du WhatsApp.

### 5.5 Autres pages publiques

- **Accueil** (ordre) : Hero → chiffres clés → Présentation (texte + visuel) → Nos domaines (4 grandes cartes image + icône + nombre d'offres) → Offres phares → Projets fonciers (cartes avec visuel, superficie, statut publiable) → Nos valeurs (fond marine, liste des valeurs réelles) → Bandeau CTA devis (fond image/scène) → Contact rapide. **Aucune** section témoignages/clients/réalisations tant qu'il n'y a pas de contenu réel.
- **Entreprise** : mise en page éditoriale (présentation, mission/vision en deux colonnes illustrées, valeurs en grille iconographiée, ambition, signatures).
- **Activités** : un bloc par domaine alterné gauche/droite avec visuel, liste des offres en mini-cartes.
- **Projets** : cartes avec visuel de couverture, filtres simples (statut d'avancement publié, préfecture) si ≥ 2 valeurs distinctes ; fiche projet avec galerie (médias réels uniquement) et visuel par défaut sinon.
- **Contact** : coordonnées en cartes, formulaire en page (pas seulement en modale), **carte** OpenStreetMap intégrée (iframe `openstreetmap.org/export/embed.html`, sans clé) **uniquement si** des coordonnées publiques du siège sont renseignées (nouveaux champs `company_profile.office_lat/office_lng`, voir Q3), réseaux sociaux.
- **404** et écrans de chargement/erreur restylés.

### 5.7 Photos libres de droits (décision Q1)

**Usage autorisé** : fonds du hero, bannières des pages intérieures (`PageHero`), visuels de couverture des 4 catégories, bandeau CTA de l'accueil, image Open Graph par défaut. **Les cartes d'offres gardent les illustrations SVG générées** (§ 5.3) tant qu'aucune vraie photo n'est téléversée.

**Sélection**
- Sources : Unsplash ou Pexels uniquement (licences permettant l'usage commercial sans attribution obligatoire). Noter pour chaque photo : URL source, auteur, licence.
- Sujets pertinents et crédibles pour la Guinée / l'Afrique de l'Ouest : terrassement et engins de chantier, routes en latérite, construction de bâtiments, terrains et paysages de savane ou côtiers, quartiers résidentiels modernes, port à conteneurs, logistique. Privilégier les scènes sans personnes identifiables.
- **Interdits** : visages reconnaissables en gros plan, logos ou marques visibles, monuments ou lieux identifiables d'un autre pays, paysages manifestement non africains (neige, architecture européenne), images retouchées de façon trompeuse.
- Lot attendu : 3 photos hero (une par slide), 5 bannières de pages (Entreprise, Activités, Offres, Projets, Contact), 4 couvertures de catégories, 1 photo pour le bandeau CTA. Proposer le lot (vignettes + justification de chaque choix) **pour validation avant intégration**.

**Intégration**
- Optimisation : WebP, 1920 px et 960 px de large, qualité 0,8, ≤ 250 Ko pour la taille 1920.
- Stockage : téléversement dans le bucket `public-media` + enregistrement dans `media` avec `kind = 'illustration'`, `credit = "Photo : <Auteur> / <Unsplash|Pexels>"`, `alt` descriptif en français, puis rattachement (`hero_slides.background_media_id`, `activity_domains.cover_media_id`, etc.) via une **migration de données** distincte. Ainsi, chaque photo est remplaçable depuis la médiathèque de l'admin.
- Si le téléversement automatisé n'est pas possible, placer les fichiers dans `public/assets/photos/` avec un manifeste `photos.json` (fichier, source, auteur, licence, alt) et les utiliser comme repli codé.
- Affichage : mention discrète « Photo d'illustration » en bas de l'image (coin, texte 10–11 px, contraste suffisant). Le crédit apparaît dans la médiathèque et sur une ligne « Crédits photos » des mentions légales.
- Fichier `docs/CREDITS-PHOTOS.md` tenu à jour.

### 5.6 SEO technique
- `public/robots.txt` (Disallow `/admin`), `sitemap.xml` généré au build par un petit script Node lisant la base via la clé publishable (pages statiques + offres + projets publiés) — ou statique si pas d'accès réseau au build, à décider en phase 4.
- Balise `canonical`, `og:image` par page (image d'offre/projet ou visuel de marque 1200×630 en `public/og/default.png` dérivé du logo), JSON-LD `Organization` + `LocalBusiness` (uniquement champs réels), `BreadcrumbList` sur les fiches.

---

## 6. Exigences fonctionnelles — administration — O5

### 6.1 Coque de l'application (AppShell)
- **Barre latérale** marine repliable (icônes seules en mode réduit, état mémorisé dans `localStorage` protégé par try/catch), sections groupées :
  - **Pilotage** : Tableau de bord
  - **Relation client** : Demandes (badge nombre de nouvelles), Devis (vue filtrée `demande_devis`)
  - **Catalogue** : Offres, Catégories
  - **Contenus** : Page d'accueil (hero), Entreprise, Coordonnées et réseaux, Textes des pages, Projets fonciers, Médiathèque
  - **Administration** (admin uniquement) : Équipe, Journal d'activité
- **Barre supérieure** blanche : fil d'Ariane, recherche globale (Ctrl/⌘ + K : offres, projets, demandes par nom/téléphone), bouton « Voir le site », menu utilisateur (nom, rôle, profil, déconnexion).
- Mobile : tiroir latéral, tables transformées en listes de cartes.
- Typo admin : Inter 14 px, densité confortable, palette neutre (slate) + marine pour l'action principale + or pour les accents. Pas de surcharge décorative.

### 6.2 Kit UI admin (`src/admin/ui/`)
`DataTable` (recherche, tri par colonne, filtres, pagination serveur via `.range()`, sélection multiple + actions groupées publier/archiver, colonnes masquables sur mobile, état vide, squelettes de chargement), `StatCard`, `MiniBarChart`/`Sparkline` (SVG maison), `FormSection`, `StickyActionBar` (Enregistrer / Annuler / statut « modifications non enregistrées »), `ConfirmDialog` (remplace tous les `window.confirm`), `Toast` (succès/erreur, file, auto-fermeture), `StatusBadge`, `ImagePicker` (ouvre la médiathèque), `Tabs`, `Drawer`, `Skeleton`, `EmptyState`, `PublishSwitch` (brouillon / publié / archivé avec couleur).
Protection des modifications non enregistrées via `useBlocker` de React Router.

### 6.3 Tableau de bord
- Cartes KPI : nouvelles demandes, devis en attente, demandes traitées sur 30 jours, délai moyen de première prise en charge (passage de `nouveau` à `en_cours`, calculé via `audit_log` si admin, sinon masqué), offres publiées / total, projets publiés / total, médias.
- Graphique : demandes par semaine sur 12 semaines, ventilées par type (SVG empilé).
- Répartition des demandes par catégorie d'offre.
- Listes : 5 dernières demandes ; contenus en brouillon à finaliser ; offres sans image réelle (incite à téléverser).
- Alertes : notifications e-mail non envoyées (existant), coordonnées incomplètes (mentions légales vides), secrets manquants signalés par l'Edge Function.
- Admin : flux « Activité récente » (10 dernières entrées `audit_log`, libellés humains).

### 6.4 Demandes et devis
- Table : date, contact, type (badge), offre/projet/domaine, statut, notification, assignation. Filtres : statut, type, catégorie, période ; recherche nom/téléphone/e-mail.
- Fiche : existant + champs `request_details` du devis, **assignation** à un membre de l'équipe (`assigned_to`), **historique** des changements de statut (journal), boutons rapides « Marquer en cours / traitée », réponse WhatsApp/e-mail/appel (existant), notes internes.
- **Export CSV** de la vue filtrée (UTF-8 avec BOM pour Excel).

### 6.5 Catalogue
- **Offres** : table (vignette, titre, catégorie, disponibilité, mise en avant, publication, ordre) + création/édition : titre, slug auto (modifiable), catégorie, résumé (≤ 200 car., compteur), description longue, disponibilité, mise en avant, devis activé, image (ImagePicker ; aperçu de l'illustration par défaut si vide), publication, ordre (champ + boutons monter/descendre). **Aperçu de la carte** en direct à droite du formulaire. Duplication d'une offre. Suppression admin seulement.
- **Catégories** (domaines) : titre, titre court, lettre, slug, résumé, description, disponibilité, image de couverture, publication, ordre ; nombre d'offres associées ; suppression impossible si des offres y sont rattachées (message clair).

### 6.6 Contenus
- **Page d'accueil** : gestion des slides hero (liste ordonnable, activer/désactiver, aperçu plein format, image de fond via ImagePicker avec recadrage indicatif du point focal `focal_x/focal_y`).
- **Entreprise** : formulaire `company_profile` en onglets (Identité, Présentation, Mission & vision, Signatures, Mentions légales) + valeurs (liste ordonnable).
- **Coordonnées et réseaux** : téléphone, WhatsApp, e-mail, adresse, réseaux sociaux (Facebook, LinkedIn, Instagram, TikTok, YouTube, X — URL validée), visibilité publique, coordonnées du siège pour la carte.
- **Textes des pages** : les `content_blocks` existants, éditeur texte simple avec aperçu.
- **Projets fonciers** : formulaire existant **conservé dans sa logique** (validations, règle commercialisation/documents, champs privés) mais réorganisé en onglets (Général, Localisation, Statuts, Médias, Documents [admin], Jalons) + galerie de médias avec image de couverture. Documents fonciers : téléversement dans `land-documents` (admin), consultation par **URL signée 60 s**.

### 6.7 Médiathèque
- Grille + liste, recherche, filtre par type, détails (dimensions, poids, crédit, alt, utilisations).
- **Téléversement** glisser-déposer multiple vers `public-media` : redimensionnement et conversion **WebP côté navigateur** (canvas, sans dépendance) en deux tailles (`…-1920.webp` max 1920 px, `…-640.webp`), qualité 0,82 ; refus > 5 Mo source après conversion ; **texte alternatif obligatoire** ; type (photo réelle / illustration / plan / logo) ; crédit.
- Suppression bloquée si le média est utilisé (liste des usages affichée).
- Chemins : `media/<aaaa>/<mm>/<uuid>-<taille>.webp`.

### 6.8 Équipe (admin)
- Liste des membres (nom, e-mail, rôle, actif, dernière connexion).
- **Inviter** un membre (e-mail, nom, rôle) via nouvelle Edge Function `admin-users` (`verify_jwt: true`, vérifie `is_admin` côté serveur avec le JWT de l'appelant, utilise `auth.admin.inviteUserByEmail` + insertion `staff_profiles`). Modifier rôle, désactiver/réactiver (pas de suppression physique). Un admin ne peut pas se retirer ses propres droits s'il est le dernier admin.
- Page de connexion : lien **« Mot de passe oublié »** (`resetPasswordForEmail`) + page `/admin/reinitialisation` pour définir le nouveau mot de passe (et accueillir les invités).

### 6.9 Journal d'activité (admin)
Table paginée de `audit_log` : date, auteur, table (libellé humain), action, élément ; filtre par table/auteur/période ; détail avant/après en diff lisible.

---

## 7. Modifications de la base de données

Nouvelles migrations (noms indicatifs, dans cet ordre) :

1. **`…_catalog_offers.sql`**
   - `activity_services` : `slug text` (rempli depuis le titre — translittération des accents, minuscules, tirets — puis `not null`, `unique`, check regex identique aux autres slugs), `summary text` (rempli depuis `description` ou le titre), `cover_media_id uuid references media on delete set null` (+ index), `is_featured boolean not null default false`, `quote_enabled boolean not null default true`, `updated_by uuid references auth.users on delete set null` (+ index).
   - Index `activity_services_listing_idx (publication, domain_id, sort_order)`.
   - Vérifier que les règles RLS existantes couvrent les nouvelles colonnes (lecture publique : publié + domaine publié).
2. **`…_inquiry_quotes.sql`** — `alter type public.inquiry_type add value 'demande_devis'` (seul dans sa migration, contrainte Postgres) ; puis migration suivante : `inquiries.request_details jsonb` (check : objet, taille ≤ 2 Ko), `assigned_to uuid references auth.users on delete set null` (+ index).
3. **`…_hero_and_company.sql`** — `hero_slides.focal_x/focal_y numeric(4,3) default 0.5` (check 0–1) ; `company_profile.office_lat/office_lng` (publics, check plages) ; `company_contacts` : check que `raw_value` est une URL https pour `kind = 'social'`.
4. **`…_media_variants.sql`** — `media.variants jsonb` (chemins des tailles), `media.bytes integer`, `media.updated_at`.
5. **`…_staff_admin.sql`** — `staff_profiles.last_sign_in_at` alimenté par l'Edge Function ou lu via elle ; garde-fou SQL « au moins un admin actif » (trigger).

Chaque migration : RLS, index des FK, audit si table de contenu, commentaires SQL en français comme l'existant. Puis régénération des types.

---

## 8. Exigences non fonctionnelles

| Domaine | Exigence |
|---|---|
| Performance | Lighthouse mobile ≥ 85 (perf), ≥ 95 (accessibilité, bonnes pratiques, SEO) sur `/`, `/offres`, `/offres/:slug`. JS public initial ≤ 250 Ko gzip (l'admin est hors bundle public). |
| Accessibilité | WCAG 2.1 AA ; carrousel pausable ; modales avec piège de focus (existant à conserver) ; labels de formulaires ; alt sur toutes les images (illustrations décoratives : `alt=""` + mention texte). |
| Sécurité | RLS testée pour `anon`, `editeur`, `admin` sur chaque nouvelle table (requêtes SQL de vérification fournies dans le compte rendu) ; Edge Functions : CORS restreint, validation stricte, messages d'erreur génériques. |
| Compatibilité | Chrome/Edge/Firefox/Safari 2 dernières versions, Android Chrome bas de gamme. |
| Qualité | `npm run check` vert ; aucun `any` ajouté ; pas de code mort ; composants < 300 lignes (découper sinon). |

---

## 9. Plan de livraison (phases avec critères d'acceptation)

### Phase 0 — Cadrage (aucune modification fonctionnelle)
- Lire ce PRD, `README.md`, l'arborescence complète. Créer `CLAUDE.md` (règles du § 3, commandes, architecture résumée). Vérifier `npm run check` / `npm run build`.
- **Livrable** : compte rendu listant les écarts éventuels entre le PRD et le code + questions ouvertes. Commit `chore: phase 0 v2 — CLAUDE.md et cadrage`.

### Phase 1 — Fondations du design system public
- Composants § 4.2, `Reveal`, `SmartImage`, refonte Header/Footer (§ 4.3), réseaux sociaux lus depuis la base, mise à jour de `PageHero`.
- **Acceptation** : toutes les pages existantes utilisent les nouveaux composants sans régression ; header transparent→opaque fonctionnel ; reduced-motion respecté.

### Phase 2 — Hero immersif + photos
- Proposition du lot de photos libres de droits (§ 5.7) → **arrêt pour validation du lot** → optimisation, intégration, crédits.
- `HeroScene` animée (repli), carrousel des slides, Ken Burns sur photo, chiffres clés en chevauchement, bannières photo des pages intérieures.
- **Acceptation** : 60 fps, LCP < 2,5 s, aucun contrôle si une seule slide, photo remplaçable depuis la base, mention « Photo d'illustration » visible, `docs/CREDITS-PHOTOS.md` complet.

### Phase 3 — Catalogue d'offres + illustrations + devis
- Migrations 1 et 2, types, loader public étendu (`offers` dans `SiteContent`), pages `/offres` et `/offres/:slug`, 26 illustrations SVG + planche de contrôle, extension du formulaire et de l'Edge Function, intégration accueil/activités.
- **Acceptation** : les 21 offres réelles s'affichent avec une illustration cohérente ; filtres + recherche + URL ; une demande de devis arrive en base avec `type = 'demande_devis'`, `service_id` et `request_details`, et l'e-mail porte le bon objet.

### Phase 4 — Refonte des pages publiques restantes + SEO technique
- Accueil complet (§ 5.5), Entreprise, Activités, Projets (visuels + filtres), Contact (formulaire en page, carte conditionnelle), 404, robots/sitemap/canonical/OG/JSON-LD.
- **Acceptation** : Lighthouse conforme au § 8 ; aucune information inventée (relecture section par section dans le compte rendu).

### Phase 5 — Coque et kit UI de l'administration
- AppShell § 6.1, kit § 6.2, migration des pages admin existantes (Dashboard, Demandes, Projets) vers le kit, remplacement des `window.confirm`.
- **Acceptation** : navigation complète au clavier, mobile utilisable, aucune régression des fonctions E1-E2.

### Phase 6 — Modules d'administration
- 6a Tableau de bord enrichi · 6b Demandes & devis (assignation, export CSV) · 6c Catalogue (offres, catégories) · 6d Médiathèque · 6e Contenus (hero, entreprise, coordonnées, textes) · 6f Projets en onglets + médias + documents · 6g Équipe + Edge Function `admin-users` + mot de passe oublié · 6h Journal.
- Un commit (et un arrêt pour validation) par sous-module.
- **Acceptation** : tout le contenu public est modifiable sans SQL ; un éditeur ne voit ni Équipe ni Journal et ne peut rien supprimer (vérifié par RLS, pas seulement par l'UI).

### Phase 7 — Recette
- Parcours complets (visiteur, éditeur, admin), tests RLS, contrôle des performances, mise à jour du README, liste des secrets/paramètres à configurer pour la mise en ligne.

---

## 10. Questions ouvertes (à faire trancher par le propriétaire — ne pas décider seul)

- ~~Q1 — Photos~~ **Tranché : OUI.** Photos libres de droits autorisées selon le § 5.7 (hero, bannières, catégories, CTA). Les cartes d'offres restent en illustrations SVG par défaut.
- ~~Q2 — Prix~~ **Tranché : NON.** Aucun prix, fourchette ni budget, nulle part. Mention « Sur devis ».
- **Q3 — Carte** : quelles coordonnées publiques pour le siège (Dubréka ? Conakry ?) *Par défaut : carte masquée.*
- **Q4 — Réseaux sociaux** : quelles URL officielles ? *Par défaut : section masquée.*
- **Q5 — Domaine e-mail Resend** : domaine à vérifier pour que les notifications partent réellement (alerte actuelle du tableau de bord).
- **Q6 — Hébergement** de production (Vercel, Netlify, Cloudflare Pages…) pour la réécriture SPA et `ALLOWED_ORIGINS`.

---

## 11. Définition de « terminé » (pour chaque phase)

- [ ] Fonctionnalités de la phase conformes au PRD et aux règles du § 3
- [ ] `npm run check` et `npm run build` verts
- [ ] Vérifié visuellement en 375 / 768 / 1280 px, clavier et reduced-motion
- [ ] Migrations : SQL montré et validé avant application, types régénérés, RLS vérifiée
- [ ] README / CLAUDE.md à jour si nécessaire
- [ ] Commit unique, message conventionnel en français, sur `develop`
- [ ] Compte rendu : fait / non fait / écarts / questions — puis **arrêt**
