# E.GUITAP

Site institutionnel et catalogue de E.GUITAP — BTP, immobilier, commerce général et import-export à Conakry (Guinée).

## Stack

React 19 · TypeScript 7 · Vite 8 · Tailwind CSS 4 · Supabase (à venir)

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
| `npm run lint` | Analyse du code (oxlint) |
| `npm run check` | typecheck + lint |

## Branches

- `main` : version stable, modifiée uniquement par pull request depuis `develop`.
- `develop` : branche de développement.
