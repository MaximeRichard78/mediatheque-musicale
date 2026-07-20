# Médiathèque musicale

Projet fil rouge — architecture N-tiers (controller → service → repository) avec des données mock MusicBrainz (Artist, Album, Label), et une vraie base de données Supabase en option.

## Stack

- Node.js 22.13+, TypeScript
- pnpm (workspace monorepo : `backend`, `frontend` à venir)
- Express
- Vitest + Supertest (tests)
- Supabase (base de données réelle, optionnelle)
- GitHub Actions (CI)

## Prérequis

- [Node.js](https://nodejs.org/) 22.13 ou plus (voir `.nvmrc`) — requis par `pnpm@11.9.0`
- [pnpm](https://pnpm.io/installation) (`npm install -g pnpm` si besoin)

## Cloner le projet

```bash
git clone https://github.com/MaximeRichard78/mediatheque-musicale.git
cd mediatheque-musicale
```

## Installer les dépendances

Depuis la racine du projet (une seule fois, ou après un `git pull`) :

```bash
pnpm install
```

## Configurer les variables d'environnement (backend)

```bash
cp backend/.env.example backend/.env
```

Par défaut `DATA_SOURCE=in-memory` : l'API tourne directement sur les mocks JSON, sans rien configurer de plus.

Pour brancher la vraie base Supabase, renseigne dans `backend/.env` :

```
DATA_SOURCE=supabase
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` n'est nécessaire que pour lancer le seed (voir plus bas), jamais pour le serveur lui-même.

## Lancer le serveur (développement)

```bash
pnpm --filter backend dev
```

Démarre l'API sur `http://localhost:3000` (rechargement automatique à chaque modification).

Endpoints disponibles :

| Méthode | Route                     | Description                                                                           |
| ------- | ------------------------- | ------------------------------------------------------------------------------------- |
| GET     | `/artists`                | Liste des artistes. Query params : `?genre=rock`, `?sort=genre`                       |
| GET     | `/artists/:id`            | Détail d'un artiste (404 si introuvable)                                              |
| GET     | `/albums`                 | Liste des albums. Query params : `?sort=year&order=asc\|desc`, `?group=era`           |
| POST    | `/albums/recommendations` | Recommandations par barycentre. Body JSON `{ "favoriteIds": string[] }` (400 si vide) |
| GET     | `/albums/:id`             | Détail d'un album (404 si introuvable)                                                |
| GET     | `/labels`                 | Liste des labels. Query params : `?country=GB`, `?search=...`                         |
| GET     | `/labels/:id`             | Détail d'un label (404 si introuvable)                                                |

Exemples :

```bash
curl http://localhost:3000/artists
curl "http://localhost:3000/albums?sort=year&order=desc"
curl "http://localhost:3000/albums?group=era"
curl "http://localhost:3000/labels?country=GB"
curl -i http://localhost:3000/albums/id-inconnu   # 404 attendu

# Recommandations par barycentre : remplacer l'id par un vrai id d'album (voir GET /albums)
curl -X POST http://localhost:3000/albums/recommendations \
  -H "Content-Type: application/json" \
  -d '{"favoriteIds":["de208292-8db5-3aed-a14a-b37a84d8c521"]}'
```

## Lancer les tests

```bash
pnpm --filter backend test
```

Mode "watch" (relance automatique pendant le développement) :

```bash
pnpm --filter backend test:watch
```

## Vérifier le typage et le style de code

```bash
pnpm --filter backend exec tsc --noEmit   # vérifie les types sans compiler
pnpm lint                                 # ESLint (depuis la racine, tout le repo)
pnpm format:check                         # vérifie le formatage Prettier
pnpm format                                # corrige le formatage automatiquement
```

## Compiler et lancer en production

```bash
pnpm --filter backend build      # compile src/ -> dist/
pnpm --filter backend start      # lance node dist/server.js
```

## Intégration continue

Chaque push et pull request vers `main` ou `develop` déclenche le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml), qui enchaîne : installation, lint, vérification du formatage, typecheck, tests, build. Le statut est visible dans l'onglet **Actions** du dépôt GitHub.

## Peupler la base Supabase (optionnel)

Nécessite `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans `backend/.env` (clé secrète, à récupérer sur le dashboard Supabase → Project Settings → API Keys → jamais commitée).

```bash
pnpm --filter backend seed:supabase
```

Relit les mêmes mocks JSON que le mode `in-memory` et les insère dans les tables Supabase (`artists`, `labels`, `label_artists`, `albums`, `tracks`).

## Structure du projet

```
backend/
  src/
    model/        # modèles de domaine (Artist, Album, Track, Label)
    repository/   # contrats + implémentations (in-memory, supabase)
    service/      # règles métier (tri, filtre, regroupement)
      scoring/    # moteur de recommandation (vectorisation, barycentre, stratégies de scoring)
    controller/   # routes Express (JSON, 404 propre)
    config/       # lecture des variables d'environnement
    scripts/      # scripts one-off (seed Supabase)
    data/         # mocks JSON MusicBrainz
    app.ts        # assemblage / injection de dépendances
    server.ts     # point d'entrée du serveur
```
