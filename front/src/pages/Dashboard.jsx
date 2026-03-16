import { useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import KpiCard from '../components/KpiCard'
import { fetchStatistiques } from '../api/api'
import { avg, fmt } from '../utils/format'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function Dashboard() {
  const { year } = useOutletContext()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['statistiques', { annee: year }],
    queryFn: () => fetchStatistiques({ annee: year }),
    staleTime: 10 * 60 * 1000,
  })

  const stats = data ?? []

  const populationTotale = stats
    .map(s => s.nombreHabitants)
    .filter(Boolean)
    .reduce((a, b) => a + b, 0)

  const nbDepartements = new Set(stats.map(s => s.departement?.code)).size

  const tauxSociauxMoyen = avg(stats.map(s => s.tauxLogementsSociaux))
  const tauxChomateMoyen = avg(stats.map(s => s.tauxChomageT4))

  const statsAvecTaux = stats.filter(s => s.tauxLogementsSociaux !== null)
  const sorted = [...statsAvecTaux].sort((a, b) => b.tauxLogementsSociaux - a.tauxLogementsSociaux)
  const top5 = sorted.slice(0, 5)
  const bottom5 = sorted.slice(-5).reverse()

  const byRegion = stats.reduce((acc, s) => {
    const nom = s.departement?.region?.nom
    if (!nom || s.tauxLogementsSociaux === null) return acc
    if (!acc[nom]) acc[nom] = { sum: 0, count: 0 }
    acc[nom].sum += s.tauxLogementsSociaux
    acc[nom].count += 1
    return acc
  }, {})

  const regionEntries = Object.entries(byRegion)
    .map(([nom, { sum, count }]) => ({ nom, avg: sum / count }))
    .sort((a, b) => b.avg - a.avg)

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

  const chartOptions = {
    indexAxis: 'y',
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

      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-base-content/50 text-sm mt-1">
          Vue d'ensemble du logement social en France — données {year}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <>
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

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
