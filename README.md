# Médiathèque musicale

Projet fil rouge d'architecture applicative : une API N-tiers (controller → service → repository) qui expose un catalogue musical (Artist, Album, Label) construit à partir de mocks MusicBrainz, avec possibilité de brancher une vraie base Supabase, et un moteur de recommandation par barycentre. Un frontend React minimal permet de voir tout ça en action.

## Stack

- **Backend** : Node.js 22.13+, TypeScript, Express
- **Frontend** : React, TypeScript, Vite, Tailwind CSS
- **Tests** : Vitest + Supertest
- **Base de données** : Supabase (Postgres), optionnelle — mode `in-memory` par défaut
- **Outillage** : pnpm (workspace monorepo), ESLint + Prettier, GitHub Actions (CI)

## Architecture

### N-tiers

Chaque requête traverse 3 couches, chacune ne connaissant que l'abstraction de la couche du dessous (injection de dépendances par constructeur) :

- **`controller/`** : traduit une requête HTTP en appel de service, et un résultat en réponse JSON. Aucune règle métier, 404 propre si une ressource n'existe pas.
- **`service/`** : contient les règles métier (tri, filtre, regroupement, scoring). Ne sait rien du HTTP ni de la source de données.
- **`repository/`** : accède aux données. Une interface (le contrat) et deux implémentations interchangeables : `in-memory/` (mocks JSON) et `supabase/` (vraie base Postgres).

Le choix entre `in-memory` et `supabase` se fait via la variable d'environnement `DATA_SOURCE`, sans que `service` ou `controller` n'aient besoin de changer.

### Design patterns

| Pattern       | Où                                                                                                            | Problème résolu                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Strategy**  | `service/scoring/scoring-strategy.ts` + `barycentre-scoring.strategy.ts` + `weighted-sum-scoring.strategy.ts` | Comment scorer un album ? Deux algorithmes interchangeables sans modifier `AlbumService`.                          |
| **Factory**   | `repository/repository.factory.ts`                                                                            | Qui crée les repositories (in-memory ou Supabase) ? Centralisé à un seul endroit.                                  |
| **Singleton** | `repository/supabase/supabase-client.provider.ts`                                                             | Une seule instance du client Supabase pour toute l'application.                                                    |
| **Decorator** | `service/scoring/recency-boost-scoring.decorator.ts`                                                          | Ajouter un bonus « albums récents » à n'importe quelle stratégie de scoring, sans modifier les classes existantes. |

### Moteur de recommandation (barycentre)

Pipeline **filtre → score → tri**, implémenté dans `AlbumService.recommend()` :

1. **Vectorisation** (`scoring/album-vector.ts`) : chaque album devient un vecteur de 4 attributs numériques (année de sortie, nombre de pistes, durée moyenne d'une piste, durée totale).
2. **Normalisation** (`scoring/vector-math.ts`) : chaque attribut est ramené entre 0 et 1 sur tout le catalogue, pour qu'aucun attribut à grande échelle ne domine les autres.
3. **Profil utilisateur** : le barycentre (moyenne attribut par attribut) des albums mis en favori.
4. **Filtre** : les albums déjà en favori sont exclus des recommandations.
5. **Score** : chaque album restant est noté par la stratégie de scoring choisie (distance euclidienne au profil par défaut).
6. **Tri** : du plus pertinent au moins pertinent.

Les favoris sont stockés côté client (`localStorage`, pas de système d'authentification) et envoyés dans la requête `POST /albums/recommendations`.

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

## Lancer le projet

Deux serveurs à lancer en parallèle (deux terminaux) :

```bash
pnpm --filter backend dev    # API sur http://localhost:3000
pnpm --filter frontend dev   # interface sur http://localhost:5173
```

Le frontend proxifie automatiquement `/api/*` vers `http://localhost:3000` (voir `frontend/vite.config.ts`), donc les deux doivent tourner en même temps pour que l'interface affiche des données.

### Endpoints de l'API

| Méthode | Route                     | Description                                                                                                                      |
| ------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| GET     | `/artists`                | Liste des artistes. Query params : `?genre=rock`, `?sort=genre`                                                                  |
| GET     | `/artists/:id`            | Détail d'un artiste (404 si introuvable)                                                                                         |
| GET     | `/albums`                 | Liste des albums. Query params : `?sort=year&order=asc\|desc`, `?group=era`                                                      |
| POST    | `/albums/recommendations` | Recommandations par barycentre. Query param `?boostRecent=true` optionnel. Body JSON `{ "favoriteIds": string[] }` (400 si vide) |
| GET     | `/albums/:id`             | Détail d'un album (404 si introuvable)                                                                                           |
| GET     | `/labels`                 | Liste des labels. Query params : `?country=GB`, `?search=...`                                                                    |
| GET     | `/labels/:id`             | Détail d'un label (404 si introuvable)                                                                                           |

Exemples :

```bash
curl http://localhost:3000/artists
curl "http://localhost:3000/albums?sort=year&order=desc"
curl "http://localhost:3000/albums?group=era"
curl "http://localhost:3000/labels?country=GB"
curl -i http://localhost:3000/albums/id-inconnu   # 404 attendu

# Recommandations par barycentre : remplacer l'id par un vrai id d'album (voir GET /albums)
curl -X POST "http://localhost:3000/albums/recommendations?boostRecent=true" \
  -H "Content-Type: application/json" \
  -d '{"favoriteIds":["de208292-8db5-3aed-a14a-b37a84d8c521"]}'
```

### Utiliser l'interface

Quatre onglets, chacun démontrant une capacité du backend :

- **Artistes** : filtre par genre, tri par genre.
- **Albums** : tri par année (croissant/décroissant), groupement par époque, bouton ♡/♥ pour marquer un album en favori (persisté en `localStorage`).
- **Labels** : filtre par pays exact ou recherche partielle.
- **Recommandations** : affiche les favoris enregistrés, calcule les recommandations par barycentre, avec une case à cocher pour activer le bonus « albums récents » (Decorator).

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
pnpm --filter backend exec tsc --noEmit    # backend : vérifie les types sans compiler
pnpm --filter frontend exec tsc -b         # frontend : vérifie les types sans compiler
pnpm lint                                  # ESLint (depuis la racine, tout le repo)
pnpm format:check                          # vérifie le formatage Prettier
pnpm format                                # corrige le formatage automatiquement
```

## Compiler et lancer en production

```bash
pnpm --filter backend build      # compile src/ -> dist/
pnpm --filter backend start      # lance node dist/server.js

pnpm --filter frontend build     # compile vers frontend/dist/
pnpm --filter frontend preview   # sert le build de production en local
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
    model/          # modèles de domaine (Artist, Album, Track, Label)
    repository/      # contrats + implémentations
      in-memory/      # lit les mocks JSON
      supabase/        # interroge la vraie base Postgres
      repository.factory.ts   # Factory : centralise la création des repositories
    service/          # règles métier (tri, filtre, regroupement)
      scoring/          # moteur de recommandation
        scoring-strategy.ts             # interface Strategy
        barycentre-scoring.strategy.ts   # scoring par distance au profil
        weighted-sum-scoring.strategy.ts # scoring par somme pondérée
        recency-boost-scoring.decorator.ts # Decorator : bonus albums récents
        vector-math.ts                    # normalisation, barycentre, distance
        album-vector.ts                    # vectorisation d'un Album
    controller/       # routes Express (JSON, 404 propre)
    config/           # lecture des variables d'environnement
    scripts/          # scripts one-off (seed Supabase)
    data/             # mocks JSON MusicBrainz
    app.ts            # assemblage / injection de dépendances
    server.ts         # point d'entrée du serveur

frontend/
  src/
    components/       # un composant par ressource (ArtistList, AlbumList, LabelList, RecommendationList)
    api/               # client fetch vers l'API (proxy /api)
    favorites.ts       # gestion des favoris en localStorage
    App.tsx            # navigation par onglets
```
