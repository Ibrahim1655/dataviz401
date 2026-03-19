
import { useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchStatistiques } from '../api/api'
import { fmt } from '../utils/format'

// Composant principal pour afficher la liste des départements
export default function Departements() {
  // Récupération de l'année sélectionnée depuis le contexte du layout parent
  const { year } = useOutletContext()

  // Requête pour récupérer toutes les statistiques de l'année sélectionnée
  const { data: stats = [], isLoading, isError, error } = useQuery({
    queryKey: ['statistiques', { annee: year }], // Clé unique pour le cache
    queryFn: () => fetchStatistiques({ annee: year }), // Fonction de récupération des données
    staleTime: 10 * 60 * 1000, // Cache valide pendant 10 minutes
  })

  // Tri des statistiques par nom de département en français
  const sorted = [...stats].sort((a, b) =>
    (a.departement?.nom ?? '').localeCompare(b.departement?.nom ?? '', 'fr')
  )

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
        <h1 className="text-2xl font-bold">Départements</h1>
        <p className="text-base-content/50 text-sm mt-1">
          {/* Affichage du nombre de départements et de l'année des données */}
          {sorted.length} département{sorted.length > 1 ? 's' : ''} — données {year}
        </p>
      </div>

      {/* Affichage conditionnel selon l'état de chargement */}
      {isLoading ? (
        // Indicateur de chargement centré
        <div className="flex justify-center py-24">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        // Section contenant le tableau des départements
        <section className="card bg-base-200 shadow">
          <div className="card-body p-0">
            {/* Conteneur avec défilement horizontal pour les petits écrans */}
            <div className="overflow-x-auto">
              <table className="table table-sm">
                {/* En-tête du tableau */}
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
                {/* Corps du tableau avec les données */}
                <tbody>
                  {/* Mapping sur les statistiques triées pour créer les lignes */}
                  {sorted.map(s => (
                    <tr key={s.id} className="hover">
                      {/* Colonne du code départemental */}
                      <td className="font-mono text-xs text-base-content/50 w-12">
                        {s.departement?.code}
                      </td>
                      {/* Colonne du nom du département */}
                      <td className="font-medium">{s.departement?.nom}</td>
                      {/* Colonne de la région */}
                      <td className="text-base-content/50 text-sm">{s.departement?.region?.nom}</td>
                      {/* Colonne de la population avec formatage */}
                      <td className="text-right font-mono text-sm">
                        {fmt(s.nombreHabitants, 0)}
                      </td>
                      {/* Colonne des logements sociaux avec mise en évidence si valeur présente */}
                      <td className="text-right font-mono text-sm">
                        {s.tauxLogementsSociaux !== null ? (
                          <span className="font-semibold text-primary">
                            {fmt(s.tauxLogementsSociaux)} %
                          </span>
                        ) : '—'} {/* Symbole pour valeur manquante */}
                      </td>
                      {/* Colonne du taux de chômage */}
                      <td className="text-right font-mono text-sm">
                        {s.tauxChomageT4 !== null ? `${fmt(s.tauxChomageT4)} %` : '—'}
                      </td>
                      {/* Colonne du taux de pauvreté */}
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