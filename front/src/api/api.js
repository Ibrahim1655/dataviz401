import axios from 'axios'

// on crée une instance axios avec une baseURL vide
// comme ça les requêtes passent par le proxy de vite (configuré dans vite.config.js)
// sinon on aurait des erreurs CORS en appelant directement le port 8000
const client = axios.create({ baseURL: '' })

// récupère toutes les statistiques, on peut filtrer par annee, region, departement
export const fetchStatistiques = (params = {}) =>
  client.get('/api/statistiques', { params }).then(r => r.data)

// récupère la liste de toutes les régions
export const fetchRegions = () =>
  client.get('/api/regions').then(r => r.data)

// récupère les années disponibles dans la base de données
export const fetchAnnees = () =>
  client.get('/api/statistiques/annees').then(r => r.data)
