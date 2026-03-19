
import { Link, useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchRegions, fetchStatistiques } from '../api/api'
import { avg, fmt } from '../utils/format'

// Composant principal pour afficher la liste des régions
export default function Regions() {
    // Récupération de l'année sélectionnée depuis le contexte du layout parent
    const { year } = useOutletContext()

    // Requête pour récupérer la liste de toutes les régions
    const { data: regions = [] } = useQuery({
        queryKey: ['regions'], // Clé unique pour le cache
        queryFn: fetchRegions, // Fonction de récupération des données
        staleTime: 60 * 60 * 1000, // Cache valide pendant 1 heure (données peu changeantes)
    })

    // Requête pour récupérer toutes les statistiques de l'année sélectionnée
    const { data: stats = [], isLoading, isError, error } = useQuery({
        queryKey: ['statistiques', { annee: year }],
        queryFn: () => fetchStatistiques({ annee: year }),
        staleTime: 10 * 60 * 1000, // Cache valide pendant 10 minutes
    })

    // Agrégation des statistiques par région : regrouper les stats de chaque département par code région
    const byRegion = stats.reduce((acc, s) => {
        const code = s.departement?.region?.code // Récupération du code région depuis la relation département->région
        if (!code) return acc // Si pas de code région, ignorer cette statistique
        if (!acc[code]) acc[code] = { stats: [] } // Initialisation du groupe pour cette région
        acc[code].stats.push(s) // Ajout de la statistique au groupe de la région
        return acc
    }, {}) // Objet vide comme accumulateur initial

    // Fusion des données régions avec les statistiques agrégées
    const rows = regions
        .map((r) => {
            const group = byRegion[r.code]?.stats ?? [] // Récupération des stats du groupe ou tableau vide
            return {
                code: r.code, // Code de la région
                nom: r.nom, // Nom de la région
                nbDepartements: group.length, // Nombre de départements dans la région (avec données)
                population: group.reduce((s, st) => s + (st.nombreHabitants ?? 0), 0), // Somme des populations
                tauxLogementsSociaux: avg(group.map((st) => st.tauxLogementsSociaux)), // Moyenne des taux de logements sociaux
                tauxChomageT4: avg(group.map((st) => st.tauxChomageT4)), // Moyenne des taux de chômage
                tauxPauvrete: avg(group.map((st) => st.tauxPauvrete)), // Moyenne des taux de pauvreté
            }
        })
        .sort((a, b) => a.nom.localeCompare(b.nom, 'fr')) // Tri alphabétique en français

    // Affichage d'une erreur si la requête a échoué
    if (isError) {
        return (
            <div className="p-8">
                <div className="alert alert-error">
                    <span>Impossible de charger les données : {error?.message}</span>
                </div>
            </div>
        )
    }

    // Rendu principal du composant
    return (
        // Conteneur principal avec espacement et largeur maximale
        <div className="p-6 space-y-8 max-w-7xl mx-auto">

            {/* En-tête de la page */}
            <div>
                <h1 className="text-2xl font-bold">Régions</h1>
                <p className="text-base-content/50 text-sm mt-1">
                    {/* Affichage du nombre de régions et de l'année des données */}
                    {rows.length} région{rows.length > 1 ? 's' : ''} — données {year}
                </p>
            </div>

            {/* Affichage conditionnel selon l'état de chargement */}
            {isLoading ? (
                // Indicateur de chargement centré
                <div className="flex justify-center py-24">
                    <span className="loading loading-spinner loading-lg text-primary" />
                </div>
            ) : (
                // Section contenant le tableau des régions
                <section className="card bg-base-200 shadow">
                    <div className="card-body p-0">
                        {/* Conteneur avec défilement horizontal pour les petits écrans */}
                        <div className="overflow-x-auto">
                            <table className="table table-sm">
                                {/* En-tête du tableau */}
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
                                {/* Corps du tableau avec les données agrégées */}
                                <tbody>
                                    {/* Mapping sur les lignes (régions) triées */}
                                    {rows.map(r => (
                                        <tr key={r.code} className="hover">
                                            {/* Colonne du code régional */}
                                            <td className="font-mono text-xs text-base-content/50 w-12">
                                                {r.code}
                                            </td>
                                            {/* Colonne du nom avec lien vers la page détail de la région */}
                                            <td className="font-medium">
                                                <Link to={`/regions/${r.code}`} className="link link-hover link-primary">
                                                    {r.nom}
                                                </Link>
                                            </td>
                                            {/* Colonne du nombre de départements */}
                                            <td className="text-right font-mono text-sm">{r.nbDepartements}</td>
                                            {/* Colonne de la population totale de la région */}
                                            <td className="text-right font-mono text-sm">
                                                {fmt(r.population, 0)}
                                            </td>
                                            {/* Colonne du taux moyen de logements sociaux avec mise en évidence */}
                                            <td className="text-right font-mono text-sm">
                                                {r.tauxLogementsSociaux !== null ? (
                                                    <span className="font-semibold text-primary">
                                                        {fmt(r.tauxLogementsSociaux)} %
                                                    </span>
                                                ) : '—'} {/* Symbole pour valeur manquante */}
                                            </td>
                                            {/* Colonne du taux moyen de chômage */}
                                            <td className="text-right font-mono text-sm">
                                                {r.tauxChomageT4 !== null ? `${fmt(r.tauxChomageT4)} %` : '—'}
                                            </td>
                                            {/* Colonne du taux moyen de pauvreté */}
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