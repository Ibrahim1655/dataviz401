import { useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchStatistiques } from '../api/api'
import { fmt } from '../utils/format'

export default function Departements() {
  const { year } = useOutletContext()

  const { data: stats = [], isLoading, isError, error } = useQuery({
    queryKey: ['statistiques', { annee: year }],
    queryFn: () => fetchStatistiques({ annee: year }),
    staleTime: 10 * 60 * 1000,
  })

  const sorted = [...stats].sort((a, b) =>
    (a.departement?.nom ?? '').localeCompare(b.departement?.nom ?? '', 'fr')
  )

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
        <h1 className="text-2xl font-bold">Départements</h1>
        <p className="text-base-content/50 text-sm mt-1">
          {sorted.length} département{sorted.length > 1 ? 's' : ''} — données {year}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <section className="card bg-base-200 shadow">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Département</th>
                    <th>Région</th>
                    <th className="text-right">Population</th>
                    <th className="text-right">Log. sociaux</th>
                    <th className="text-right">Chômage T4</th>
                    <th className="text-right">Taux pauvreté</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(s => (
                    <tr key={s.id} className="hover">
                      <td className="font-mono text-xs text-base-content/50 w-12">
                        {s.departement?.code}
                      </td>
                      <td className="font-medium">{s.departement?.nom}</td>
                      <td className="text-base-content/50 text-sm">{s.departement?.region?.nom}</td>
                      <td className="text-right font-mono text-sm">
                        {fmt(s.nombreHabitants, 0)}
                      </td>
                      <td className="text-right font-mono text-sm">
                        {s.tauxLogementsSociaux !== null ? (
                          <span className="font-semibold text-primary">
                            {fmt(s.tauxLogementsSociaux)} %
                          </span>
                        ) : '—'}
                      </td>
                      <td className="text-right font-mono text-sm">
                        {s.tauxChomageT4 !== null ? `${fmt(s.tauxChomageT4)} %` : '—'}
                      </td>
                      <td className="text-right font-mono text-sm">
                        {s.tauxPauvrete !== null ? `${fmt(s.tauxPauvrete)} %` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}