Tu reprends le projet E-GUITAP (site institutionnel + administration, React 19 / TypeScript / Vite / Tailwind 4 / React Router 7 / Supabase), sur la branche `develop`.

Le document de référence est `docs/PRD-refonte-v2.md`. Lis-le en entier, puis lis `README.md`, l'historique git (`git log --oneline`) et l'arborescence de `src/` et `supabase/` avant de modifier quoi que ce soit.

Objectif de cette itération : un design public professionnel, un catalogue d'offres en cartes (image, titre, description, bouton « Demander un devis ») avec une illustration SVG générée par défaut pour chaque offre, un hero immersif (image Ken Burns ou animation de marque), et une administration de niveau entreprise. Tout cela sans rien perdre de ce qui existe : schéma, RLS, Edge Function `submit-inquiry`, Turnstile, règles de contenu, et fonctions admin E1-E2.

Règles impératives :
1. Les règles permanentes du § 3 du PRD sont non négociables. N'invente jamais d'information sur l'entreprise (chiffres, clients, réalisations, prix, témoignages).
2. Travaille strictement phase par phase (§ 9). Commence par la **phase 0 uniquement** : crée `CLAUDE.md` à partir du § 3, vérifie `npm run check` et `npm run build`, puis rends-moi un compte rendu des écarts entre le PRD et le code, avec tes questions. Ensuite **arrête-toi** et attends mon feu vert.
3. À chaque phase : de nouvelles migrations seulement, et le SQL m'est montré avant toute application sur Supabase. Régénère les types, garde `check` et `build` verts, vérifie en 375, 768 et 1280 px, fais un seul commit en français sur `develop`, puis un compte rendu, puis un arrêt.
4. Pas de nouvelle dépendance sans justification écrite. Pas de librairie UI lourde. Pas de changement de stack.
5. Si quelque chose est ambigu ou contradictoire, demande-moi au lieu d'improviser. Les questions Q1 à Q6 du § 10 restent sur leur valeur par défaut tant que je n'ai pas répondu.
