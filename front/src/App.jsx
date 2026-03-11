// imports react router pour la navigation entre les pages
import { BrowserRouter, Routes, Route, useOutletContext } from 'react-router-dom'
// tanstack query pour gérer les appels API (cache, loading, erreur...)
import { useQuery } from '@tanstack/react-query'
// chart.js pour les graphiques
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import Layout from './components/Layout'
import { fetchStatistiques } from './api/api'

// on enregistre uniquement les composants chart.js dont on a besoin
// (si on enregistre tout ça alourdit le bundle inutilement)
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

// calcule la moyenne d'un tableau en ignorant les valeurs null/undefined
// (beaucoup de champs sont null dans notre dataset)
function avg(arr) {
  const vals = arr.filter(v => v !== null && v !== undefined)
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null
}

// formate un nombre en français avec le bon nombre de décimales
// retourne '—' si la valeur est null (pas de données)
function fmt(n, decimals = 1) {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('fr-FR', { maximumFractionDigits: decimals })
}

// composant carte pour afficher un indicateur clé (KPI)
function KpiCard({ label, value, unit, badge }) {
  return (
    <div className="card bg-base-200 shadow">
      <div className="card-body gap-1 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-base-content/50">{label}</p>
        <p className="text-3xl font-bold text-primary">
          {value}
          {/* l'unité s'affiche seulement si elle est fournie */}
          {unit && <span className="text-lg font-normal text-base-content/40 ml-1">{unit}</span>}
        </p>
        {badge && <div className="badge badge-outline badge-sm mt-1">{badge}</div>}
      </div>
    </div>
  )
}

// page temporaire pour les routes pas encore développées
function PlaceholderPage({ title }) {
  return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="text-center space-y-2">
        <p className="text-2xl font-bold">{title}</p>
        <p className="text-base-content/50">Page à venir</p>
      </div>
    </div>
  )
}

// page d'accueil = le tableau de bord principal
function Dashboard() {
  // on récupère l'année sélectionnée depuis le Layout via le contexte de react-router
  const { year } = useOutletContext()

  // appel API avec TanStack Query, la queryKey contient l'année
  // donc si l'année change, la requête est relancée automatiquement
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['statistiques', { annee: year }],
    queryFn: () => fetchStatistiques({ annee: year }),
    staleTime: 10 * 60 * 1000, // on garde les données en cache 10 minutes
  })

  // si les données ne sont pas encore arrivées on utilise un tableau vide
  const stats = data ?? []

  // --- calcul des indicateurs clés ---

  // population totale = somme de tous les départements (on ignore les null)
  const populationTotale = stats
    .map(s => s.nombreHabitants)
    .filter(Boolean)
    .reduce((a, b) => a + b, 0)

  // on compte les codes départements uniques pour avoir le nb de départements
  const nbDepartements = new Set(stats.map(s => s.departement?.code)).size

  const tauxSociauxMoyen = avg(stats.map(s => s.tauxLogementsSociaux))
  const tauxChomateMoyen = avg(stats.map(s => s.tauxChomageT4))

  // --- classement top / bottom 5 ---

  // on filtre d'abord les lignes sans taux (sinon le tri est faux)
  const statsAvecTaux = stats.filter(s => s.tauxLogementsSociaux !== null)
  // on trie du plus grand au plus petit
  const sorted = [...statsAvecTaux].sort((a, b) => b.tauxLogementsSociaux - a.tauxLogementsSociaux)
  const top5 = sorted.slice(0, 5)
  // pour le bottom 5 on prend les 5 derniers et on les remet dans l'ordre croissant
  const bottom5 = sorted.slice(-5).reverse()

  // --- données pour le graphique par région ---

  // on regroupe les stats par région et on additionne les taux
  const byRegion = stats.reduce((acc, s) => {
    const nom = s.departement?.region?.nom
    if (!nom || s.tauxLogementsSociaux === null) return acc
    if (!acc[nom]) acc[nom] = { sum: 0, count: 0 }
    acc[nom].sum += s.tauxLogementsSociaux
    acc[nom].count += 1
    return acc
  }, {})

  // on convertit l'objet en tableau et on calcule la moyenne par région
  const regionEntries = Object.entries(byRegion)
    .map(([nom, { sum, count }]) => ({ nom, avg: sum / count }))
    .sort((a, b) => b.avg - a.avg) // du taux le plus fort au plus faible

  // configuration des données du graphique chart.js
  const chartData = {
    labels: regionEntries.map(r => r.nom),
    datasets: [{
      label: 'Taux moyen (%)',
      data: regionEntries.map(r => parseFloat(r.avg.toFixed(2))),
      backgroundColor: 'rgba(43, 171, 136, 0.75)',
      borderColor: 'rgba(43, 171, 136, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }

  // options du graphique : barres horizontales, pas de légende, grille discrète
  const chartOptions = {
    indexAxis: 'y', // barres horizontales
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x.toFixed(1)} %` } },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { color: '#9ca3af', callback: v => `${v} %` },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#d1d5db', font: { size: 11 } },
      },
    },
  }

  // affichage de l'erreur si l'API est inaccessible
  if (isError) {
    return (
      <div className="p-8">
        <div className="alert alert-error">
          <span>Impossible de charger les données : {error?.message}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* en-tête de la page */}
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-base-content/50 text-sm mt-1">
          Vue d'ensemble du logement social en France — données {year}
        </p>
      </div>

      {/* affichage conditionnel : spinner pendant le chargement, données ensuite */}
      {isLoading ? (
        <div className="flex justify-center py-24">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <>
          {/* section indicateurs clés */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
              Indicateurs clés
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard
                label="Population totale"
                value={populationTotale ? fmt(populationTotale, 0) : '—'}
                unit="hab."
                badge="Résidents"
              />
              <KpiCard
                label="Départements"
                value={fmt(nbDepartements, 0)}
                badge="France métropolitaine + DOM"
              />
              <KpiCard
                label="Taux logements sociaux"
                value={tauxSociauxMoyen ? fmt(tauxSociauxMoyen) : '—'}
                unit="%"
                badge="Moyenne nationale"
              />
              <KpiCard
                label="Taux de chômage"
                value={tauxChomateMoyen ? fmt(tauxChomateMoyen) : '—'}
                unit="%"
                badge="T4 — Moyenne nationale"
              />
            </div>
          </section>

          {/* section tableaux classement */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* top 5 : départements avec le plus de logements sociaux */}
            <div className="card bg-base-200 shadow">
              <div className="card-body">
                <h2 className="card-title text-sm font-semibold uppercase tracking-widest text-base-content/50">
                  <span className="badge badge-success badge-xs" />
                  Top 5 — Taux de logements sociaux
                </h2>
                <div className="overflow-x-auto mt-2">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Département</th>
                        <th>Région</th>
                        <th className="text-right">Taux</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top5.map((s, i) => (
                        <tr key={s.id} className="hover">
                          <td className="text-base-content/40 font-mono text-xs w-6">{i + 1}</td>
                          <td>
                            <span className="font-medium">{s.departement?.nom}</span>
                            <span className="text-base-content/40 text-xs ml-1.5">({s.departement?.code})</span>
                          </td>
                          <td className="text-base-content/50 text-sm">{s.departement?.region?.nom}</td>
                          <td className="text-right font-mono font-semibold text-success">
                            {fmt(s.tauxLogementsSociaux)} %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* bottom 5 : départements avec le moins de logements sociaux */}
            <div className="card bg-base-200 shadow">
              <div className="card-body">
                <h2 className="card-title text-sm font-semibold uppercase tracking-widest text-base-content/50">
                  <span className="badge badge-error badge-xs" />
                  Bottom 5 — Taux de logements sociaux
                </h2>
                <div className="overflow-x-auto mt-2">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Département</th>
                        <th>Région</th>
                        <th className="text-right">Taux</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bottom5.map((s, i) => (
                        <tr key={s.id} className="hover">
                          <td className="text-base-content/40 font-mono text-xs w-6">{i + 1}</td>
                          <td>
                            <span className="font-medium">{s.departement?.nom}</span>
                            <span className="text-base-content/40 text-xs ml-1.5">({s.departement?.code})</span>
                          </td>
                          <td className="text-base-content/50 text-sm">{s.departement?.region?.nom}</td>
                          <td className="text-right font-mono font-semibold text-error">
                            {fmt(s.tauxLogementsSociaux)} %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* graphique en barres par région (affiché seulement si on a des données) */}
          {regionEntries.length > 0 && (
            <section>
              <div className="card bg-base-200 shadow">
                <div className="card-body">
                  <h2 className="card-title text-sm font-semibold uppercase tracking-widest text-base-content/50">
                    Taux moyen de logements sociaux par région
                  </h2>
                  <p className="text-base-content/40 text-xs">
                    En % des résidences principales — données {year}
                  </p>
                  {/* hauteur dynamique selon le nombre de régions pour que les barres ne soient pas trop compressées */}
                  <div style={{ height: `${regionEntries.length * 36 + 40}px` }} className="mt-4">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

// composant racine : on met en place le router et les routes de l'application
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout est le composant parent de toutes les pages */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/regions" element={<PlaceholderPage title="Régions" />} />
          <Route path="/departements" element={<PlaceholderPage title="Départements" />} />
          <Route path="/comparateur" element={<PlaceholderPage title="Comparateur" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
