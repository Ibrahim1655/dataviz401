import { Link, useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchRegions, fetchStatistiques } from '../api/api'
import { avg, fmt } from '../utils/format'

export default function Regions() {
    const { year } = useOutletContext()

    const { data: regions = [] } = useQuery({
        queryKey: ['regions'],
        queryFn: fetchRegions,
        staleTime: 60 * 60 * 1000,
    })

    const { data: stats = [], isLoading, isError, error } = useQuery({
        queryKey: ['statistiques', { annee: year }],
        queryFn: () => fetchStatistiques({ annee: year }),
        staleTime: 10 * 60 * 1000,
    })

    // agrège les stats par région
    const byRegion = stats.reduce((acc, s) => {
        const code = s.departement?.region?.code
        if (!code) return acc
        if (!acc[code]) acc[code] = { stats: [] }
        acc[code].stats.push(s)
        return acc
    }, {})

    // fusionne régions + stats agrégées
    const rows = regions
        .map((r) => {
            const group = byRegion[r.code]?.stats ?? []
            return {
                code: r.code,
                nom: r.nom,
                nbDepartements: group.length,
                population: group.reduce((s, st) => s + (st.nombreHabitants ?? 0), 0),
                tauxLogementsSociaux: avg(group.map((st) => st.tauxLogementsSociaux)),
                tauxChomageT4: avg(group.map((st) => st.tauxChomageT4)),
                tauxPauvrete: avg(group.map((st) => st.tauxPauvrete)),
            }
        })
        .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))

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
                <h1 className="text-2xl font-bold">Régions</h1>
                <p className="text-base-content/50 text-sm mt-1">
                    {rows.length} région{rows.length > 1 ? 's' : ''} — données {year}
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
                                        <th>Région</th>
                                        <th className="text-right">Départements</th>
                                        <th className="text-right">Population</th>
                                        <th className="text-right">Log. sociaux</th>
                                        <th className="text-right">Chômage T4</th>
                                        <th className="text-right">Taux pauvreté</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map(r => (
                                        <tr key={r.code} className="hover">
                                            <td className="font-mono text-xs text-base-content/50 w-12">
                                                {r.code}
                                            </td>
                                            <td className="font-medium">
                                                <Link to={`/regions/${r.code}`} className="link link-hover link-primary">
                                                    {r.nom}
                                                </Link>
                                            </td>
                                            <td className="text-right font-mono text-sm">{r.nbDepartements}</td>
                                            <td className="text-right font-mono text-sm">
                                                {fmt(r.population, 0)}
                                            </td>
                                            <td className="text-right font-mono text-sm">
                                                {r.tauxLogementsSociaux !== null ? (
                                                    <span className="font-semibold text-primary">
                                                        {fmt(r.tauxLogementsSociaux)} %
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="text-right font-mono text-sm">
                                                {r.tauxChomageT4 !== null ? `${fmt(r.tauxChomageT4)} %` : '—'}
                                            </td>
                                            <td className="text-right font-mono text-sm">
                                                {r.tauxPauvrete !== null ? `${fmt(r.tauxPauvrete)} %` : '—'}
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