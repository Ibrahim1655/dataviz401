# Documentation — SAÉ 401 DataViz Logement Social

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture du projet](#2-architecture-du-projet)
3. [Back-end Symfony](#3-back-end-symfony)
   - [Entités](#entités)
   - [Contrôleurs et routes API](#contrôleurs-et-routes-api)
   - [Format des réponses JSON](#format-des-réponses-json)
4. [Front-end React](#4-front-end-react)
   - [Structure des fichiers](#structure-des-fichiers)
   - [Rôle de chaque fichier](#rôle-de-chaque-fichier)
5. [Choix techniques](#5-choix-techniques)
6. [Flux de données](#6-flux-de-données)
7. [Proxy Vite et CORS](#7-proxy-vite-et-cors)

---

## 1. Vue d'ensemble

Ce projet est une application de visualisation de données sur le logement social en France.

- **Données** : 300 entrées — 100 départements × 3 années (2021, 2022, 2023), issues de l'INSEE, du RPLS et de CDC Habitat.
- **Objectif** : permettre d'explorer et comparer des indicateurs socio-économiques (taux de logements sociaux, chômage, pauvreté, démographie…) à l'échelle du département et de la région.
- **Accès** : données publiques open data, aucune authentification requise.

---

## 2. Architecture du projet

```
sae401_dataviz/
├── back/          ← API REST Symfony (PHP)
├── front/         ← Application React (Vite)
└── DOCUMENTATION.md
```

Le back-end expose une API REST. Le front-end la consomme via Axios. Les deux tournent sur des ports différents ; un proxy Vite évite les problèmes CORS en développement.

```
Navigateur
    │
    ▼
React (localhost:5173)
    │  requêtes /api/*  (proxifiées par Vite)
    ▼
Symfony (localhost:8000)
    │
    ▼
Base de données MySQL (XAMPP)
```

---

## 3. Back-end Symfony

### Entités

| Entité | Table | Description |
|---|---|---|
| `Region` | `region` | Code INSEE + nom de la région (ex. `11` / Île-de-France) |
| `Departement` | `departement` | Code INSEE + nom + clé étrangère vers `Region` |
| `StatistiquesDepartement` | `statistiques_departement` | 15 indicateurs annuels liés à un département |

Relations :
- `Region` → `Departement` : **OneToMany**
- `Departement` → `StatistiquesDepartement` : **OneToMany**

### Contrôleurs et routes API

#### `RegionController`

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/regions` | Liste toutes les régions (`code`, `nom`) |
| GET | `/api/regions/{code}` | Détail d'une région + liste de ses départements |

#### `DepartementController`

| Méthode | Route | Paramètres | Description |
|---|---|---|---|
| GET | `/api/departements` | `?region={code}` (optionnel) | Liste les départements, filtrables par région |
| GET | `/api/departements/{code}` | — | Détail d'un département avec sa région |

#### `StatistiquesController`

| Méthode | Route | Paramètres | Description |
|---|---|---|---|
| GET | `/api/statistiques` | `?annee=`, `?region=`, `?departement=` | Toutes les stats, combinaison de filtres possible |
| GET | `/api/statistiques/{id}` | — | Une entrée par son identifiant |
| GET | `/api/statistiques/annees` | — | Liste des années disponibles dans la base |
| GET | `/api/statistiques/region/{codeRegion}` | `?annee=` (optionnel) | Stats de tous les départements d'une région |

> **Note** : la route `/api/statistiques/annees` est déclarée avec `priority: 1` pour éviter qu'elle soit confondue avec `/api/statistiques/{id}` (le segment `annees` serait sinon interprété comme un `id`).

### Format des réponses JSON

Toutes les réponses sont sérialisées manuellement dans `formatStatistique()` pour contrôler exactement les champs exposés (pas de sérialisation automatique Symfony, pas de données parasites).

Structure d'un objet statistique :

```json
{
  "id": 1,
  "anneePublication": 2023,
  "departement": {
    "code": "75",
    "nom": "Paris",
    "region": {
      "code": "11",
      "nom": "Île-de-France"
    }
  },
  "nombreHabitants": 2133111,
  "densitePopulation": 20755.0,
  "variationPopulation10Ans": -1.2,
  "contributionSoldeNaturel": 0.8,
  "contributionSoldeMigratoire": -2.0,
  "pourcentageMoins20Ans": 19.5,
  "pourcentagePlus60Ans": 18.2,
  "tauxChomageT4": 8.1,
  "tauxPauvrete": 15.6,
  "nombreLogements": 1234567,
  "nombreResidencesPrincipales": 1100000,
  "tauxLogementsSociaux": 12.5,
  "tauxLogementsVacants": 7.3
}
```

Les champs peuvent être `null` quand la donnée source est absente (couverture incomplète du dataset).

---

## 4. Front-end React

### Structure des fichiers

```
front/src/
├── main.jsx                    ← Point d'entrée React, providers globaux
├── App.jsx                     ← Déclaration des routes
├── index.css                   ← Import Tailwind + thème DaisyUI
│
├── api/
│   └── api.js                  ← Fonctions d'appel HTTP (Axios)
│
├── utils/
│   └── format.js               ← Fonctions utilitaires de formatage
│
├── components/
│   ├── Layout.jsx              ← Structure générale de l'application
│   ├── Sidebar.jsx             ← Navigation + sélecteur d'année
│   ├── KpiCard.jsx             ← Carte indicateur clé (KPI)
│   └── PlaceholderPage.jsx     ← Page temporaire pour routes à venir
│
└── pages/
    └── Dashboard.jsx           ← Page d'accueil / tableau de bord
```

### Rôle de chaque fichier

#### `main.jsx`
Point d'entrée de l'application. Instancie le `QueryClient` de TanStack Query avec des options par défaut (`staleTime: 5 min`, `retry: 1`) et l'enveloppe dans `QueryClientProvider` pour le rendre accessible à toute l'arborescence.

#### `App.jsx`
Déclare l'arborescence de routes avec React Router v7. Le composant `Layout` est le parent de toutes les pages — il est passé comme `element` d'une `Route` sans `path`, ce qui permet d'afficher la sidebar et la navbar sur toutes les pages sans répétition.

```
<Layout>
  ├── /                → Dashboard
  ├── /regions         → PlaceholderPage
  ├── /departements    → PlaceholderPage
  └── /comparateur     → PlaceholderPage
```

#### `api/api.js`
Crée une instance Axios avec `baseURL: ''` (chemin relatif) pour que toutes les requêtes passent par le proxy Vite. Exporte trois fonctions :

| Fonction | Appel API |
|---|---|
| `fetchStatistiques(params)` | `GET /api/statistiques` avec les params en query string |
| `fetchRegions()` | `GET /api/regions` |
| `fetchAnnees()` | `GET /api/statistiques/annees` |

#### `utils/format.js`
Deux fonctions pures réutilisables sur toutes les pages :

- `avg(arr)` : calcule la moyenne d'un tableau en ignorant les valeurs `null`/`undefined`. Retourne `null` si aucune valeur valide.
- `fmt(n, decimals)` : formate un nombre en notation française (`toLocaleString('fr-FR')`). Retourne `'—'` si la valeur est `null`.

#### `components/Layout.jsx`
Composant racine de la mise en page. Utilise le composant **Drawer** de DaisyUI pour gérer la sidebar :
- Sur **desktop** (`lg:drawer-open`) : la sidebar est toujours visible à gauche.
- Sur **mobile** : la sidebar se masque derrière un overlay, ouvrable via un bouton hamburger dans la navbar du haut.

L'année sélectionnée est stockée dans l'URL via `useSearchParams` (`?annee=2023`). Cela permet de partager un lien en conservant le contexte. L'année est transmise aux pages enfants via `<Outlet context={{ year }}>`.

#### `components/Sidebar.jsx`
Affiche :
- Le titre de l'application.
- La liste de navigation (`NavLink` avec `end={true}` sur `/` pour éviter qu'elle reste active sur toutes les routes).
- Le sélecteur d'année (groupe de boutons `join` DaisyUI, années 2021–2023 codées en dur car le dataset est fixe).

#### `components/KpiCard.jsx`
Carte réutilisable pour afficher un indicateur clé. Props :
- `label` : libellé descriptif
- `value` : valeur formatée (string)
- `unit` : unité affichée en petit après la valeur (ex. `%`, `hab.`)
- `badge` : étiquette contextuelle sous la valeur

#### `components/PlaceholderPage.jsx`
Page générique affichée sur les routes pas encore développées (`/regions`, `/departements`, `/comparateur`). Reçoit un `title` en prop.

#### `pages/Dashboard.jsx`
Page principale. Contient toute la logique de la vue d'ensemble :

1. **Récupération des données** via `useQuery` (TanStack Query). La `queryKey` inclut l'année, donc un changement d'année déclenche automatiquement un nouvel appel.
2. **Calcul des KPIs** : population totale (somme), nombre de départements (Set de codes uniques), taux moyens (via `avg()`).
3. **Classement Top/Bottom 5** : tri par `tauxLogementsSociaux` décroissant, exclusion des `null`.
4. **Graphique par région** : agrégation des stats par `region.nom`, calcul de la moyenne, rendu via `react-chartjs-2` en barres horizontales.

---

## 5. Choix techniques

### Vite
Bundler moderne avec démarrage à froid quasi-instantané (ESM natif en dev). Supporte le proxy HTTP nativement, ce qui résout les problèmes CORS sans toucher au back.

### React 19
Version LTS actuelle. Pas de changement d'API notable par rapport à React 18 pour ce projet.

### Tailwind CSS 4 + plugin `@tailwindcss/vite`
Tailwind v4 supprime le fichier `tailwind.config.js` : toute la configuration se fait en CSS via des directives `@theme`. Le plugin Vite intègre la compilation directement dans le pipeline Vite sans PostCSS séparé.

### DaisyUI 5
Bibliothèque de composants construite sur Tailwind. Fournit des classes sémantiques (`btn`, `card`, `table`, `drawer`, `badge`, `join`…) qui évitent de composer manuellement des dizaines de classes utilitaires. Compatible avec le système de thèmes de Tailwind.

Raisons du choix :
- Pas de dépendance JavaScript (contrairement à Material UI ou Chakra) — le bundle reste léger.
- Thèmes prêts à l'emploi (`dark`, `light`, etc.) sans configuration.
- Composants adaptés aux dashboards (drawer, table, badge, stat…).

### TanStack Query v5
Gestion du state serveur (cache, loading, erreur, refetch). Remplace un `useEffect` + `useState` manuel par un `useQuery` déclaratif.

Avantages concrets dans ce projet :
- **Cache automatique** : les données d'une année déjà consultée ne sont pas re-fetché si `staleTime` n'est pas écoulé.
- **Déduplication** : plusieurs composants qui consomment la même `queryKey` partagent le même appel réseau.
- **États gérés proprement** : `isLoading`, `isError`, `data` disponibles sans boilerplate.

### Axios
Client HTTP avec une API plus ergonomique que `fetch` natif : gestion des `params` en query string, interception possible, instanciation avec `baseURL`. L'instance partagée dans `api.js` centralise la configuration.

### React Router v7
Gestion des routes côté client. L'utilisation du pattern `<Outlet>` avec `useOutletContext` permet de partager l'état global (année) entre le Layout et les pages sans Redux ni Context API supplémentaire.

### Chart.js + react-chartjs-2
Chart.js est la librairie de graphiques la plus répandue pour le web. `react-chartjs-2` en est le wrapper React officiel. Les composants Chart.js sont enregistrés à la demande (`ChartJS.register(...)`) pour ne pas inclure les types de graphiques inutilisés dans le bundle.

---

## 6. Flux de données

```
Sélection d'année (Sidebar)
        │
        ▼
URL mise à jour (?annee=2023)
        │
        ▼
Layout lit l'URL → transmet year via Outlet context
        │
        ▼
Dashboard reçoit year via useOutletContext()
        │
        ▼
useQuery(['statistiques', { annee: year }])
        │
        ├── Cache valide → données servies depuis le cache
        │
        └── Cache expiré → fetchStatistiques({ annee: year })
                │
                ▼
            GET /api/statistiques?annee=2023
                │
                ▼
            Symfony filtre + retourne JSON
                │
                ▼
            Dashboard calcule KPIs, Top5, Bottom5, byRegion
                │
                ▼
            Rendu : KpiCard × 4, tables Top/Bottom 5, graphique Bar
```

---

## 7. Proxy Vite et CORS

En développement, le front tourne sur `localhost:5173` et le back sur `localhost:8000`. Sans configuration, les navigateurs bloquent les requêtes cross-origin.

La solution retenue est un **proxy Vite** déclaré dans `vite.config.js` :

```js
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
  },
}
```

Tout appel à `/api/*` depuis le front est transparement redirigé vers Symfony. Du point de vue du navigateur, la requête reste sur `localhost:5173` — pas de problème CORS.

L'instance Axios est créée avec `baseURL: ''` (vide) pour que les chemins restent relatifs et passent bien par ce proxy :

```js
const client = axios.create({ baseURL: '' })
// → /api/statistiques  →  proxy  →  http://127.0.0.1:8000/api/statistiques
```

En production, il faudrait soit configurer CORS côté Symfony (`nelmio/cors-bundle`), soit servir le front et le back sur le même domaine via un reverse proxy (nginx/Apache).
