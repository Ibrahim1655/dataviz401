
import { Link, useParams, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { fetchRegion, fetchStatistiquesByRegion } from "../api/api";
import KpiCard from "../components/KpiCard";
import { avg, fmt } from "../utils/format";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

// Définition des années 
const ANNEES = [2021, 2022, 2023];

// Composant principal pour afficher les détails d'une région
export default function RegionDetail() {
  // Récupération du code de la région depuis les paramètres d'URL
  const { code } = useParams();
  // Récupération de l'année sélectionnée depuis le contexte du layout
  const { year } = useOutletContext();

  // Requête pour récupérer les informations de la région
  const { data: region } = useQuery({
    queryKey: ["region", code],
    queryFn: () => fetchRegion(code),
    staleTime: 60 * 60 * 1000, // Cache valide pendant 1 heure
  });

  // Création de requêtes pour chaque année afin de récupérer les statistiques de tous les départements de la région
  const queries = ANNEES.map((annee) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ["statistiques-region", code, annee],
      queryFn: () => fetchStatistiquesByRegion(code, { annee }),
      staleTime: 10 * 60 * 1000, // Cache valide pendant 10 minutes
    })
  );

  // Vérification si les données sont en cours de chargement ou s'il y a une erreur
  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  // Récupération des statistiques de l'année actuelle pour tous les départements de la région
  const currentStats = queries[ANNEES.indexOf(year)]?.data ?? [];

  // Agrégation des statistiques de l'année courante pour obtenir les moyennes et totaux régionaux
  const agg = {
    population: currentStats.reduce((s, st) => s + (st.nombreHabitants ?? 0), 0), // Somme des popu
    densitePopulation: avg(currentStats.map((st) => st.densitePopulation)), // Moyenne des densités
    tauxLogementsSociaux: avg(currentStats.map((st) => st.tauxLogementsSociaux)), // Moyenne des taux
    tauxChomageT4: avg(currentStats.map((st) => st.tauxChomageT4)), // Moyenne des taux de chômage
    tauxPauvrete: avg(currentStats.map((st) => st.tauxPauvrete)), // Moyenne des taux de pauvreté
    pourcentageMoins20Ans: avg(currentStats.map((st) => st.pourcentageMoins20Ans)), // Moyenne démographique
    pourcentagePlus60Ans: avg(currentStats.map((st) => st.pourcentagePlus60Ans)), // Moyenne démographique
    contributionSoldeNaturel: avg(currentStats.map((st) => st.contributionSoldeNaturel)), // Moyenne des soldes
    contributionSoldeMigratoire: avg(currentStats.map((st) => st.contributionSoldeMigratoire)), // Moyenne des soldes
    nombreLogements: currentStats.reduce((s, st) => s + (st.nombreLogements ?? 0), 0), // Somme des logements
    nombreResidencesPrincipales: currentStats.reduce((s, st) => s + (st.nombreResidencesPrincipales ?? 0), 0), // Somme des résidences
    tauxLogementsVacants: avg(currentStats.map((st) => st.tauxLogementsVacants)), // Moyenne des taux de vacance
  };

  // Construction des données d'évolution pour les graphiques (moyennes par année)
  const evolution = {
    tauxLogementsSociaux: ANNEES.map((_, i) => avg((queries[i]?.data ?? []).map((st) => st.tauxLogementsSociaux))),
    tauxChomageT4: ANNEES.map((_, i) => avg((queries[i]?.data ?? []).map((st) => st.tauxChomageT4))),
    tauxPauvrete: ANNEES.map((_, i) => avg((queries[i]?.data ?? []).map((st) => st.tauxPauvrete))),
    population: ANNEES.map((_, i) => (queries[i]?.data ?? []).reduce((s, st) => s + (st.nombreHabitants ?? 0), 0) || null), // Somme des populations par année
  };

  // Fonction pour créer la configuration des graphiques en ligne
  const makeLineChart = (data, color) => ({
    labels: ANNEES,
    datasets: [{
      data,
      borderColor: color,
      backgroundColor: color + "20", // Couleur avec transparence pour le remplissage
      borderWidth: 2,
      pointRadius: 4,
      tension: 0.3, // Courbure des lignes
      fill: true, // Remplissage sous la ligne
    }],
  });

  // Configuration des options pour les graphiques en ligne
  const lineOptions = (unit) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Masquer la légende
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${fmt(ctx.parsed.y)} ${unit}` // Formatage des tooltips
        }
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.06)" }, // Couleur de la grille
        ticks: { color: "#9ca3af" } // Couleur des étiquettes
      },
      y: {
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: {
          color: "#9ca3af",
          callback: (v) => `${v} ${unit}` // Formatage des valeurs sur l'axe Y
        }
      },
    },
  });

  // Affichage d'une erreur si les données n'ont pas pu être chargées
  if (isError) {
    return (
      <div className="p-8">
        <div className="alert alert-error">
          <span>Impossible de charger les données pour cette région.</span>
        </div>
      </div>
    );
  }

  // Rendu principal du composant
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* Fil d'Ariane pour la navigation */}
      <div className="text-sm breadcrumbs text-base-content/50">
        <ul>
          <li><Link to="/regions">Régions</Link></li>
          <li className="text-base-content">{region?.nom ?? code}</li>
        </ul>
      </div>

      {/* En-tête avec le code et le nom de la région */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge badge-outline badge-lg font-mono">{code}</span>
          <h1 className="text-2xl font-bold">{region?.nom ?? "…"}</h1>
        </div>
        <p className="text-base-content/50 text-sm mt-1">
          {/* Affichage du nombre de départements dans la région */}
          {region?.departements?.length ?? 0} département{(region?.departements?.length ?? 0) > 1 ? 's' : ''} — données {year}
        </p>
      </div>

      {/* Affichage conditionnel selon l'état des données */}
      {isLoading ? (
        // Indicateur de chargement
        <div className="flex justify-center py-24">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : currentStats.length === 0 ? (
        // Message d'avertissement si aucune donnée pour l'année sélectionnée
        <div className="alert alert-warning">
          <span>Aucune donnée disponible pour {year}.</span>
        </div>
      ) : (
        <>
          {/* Section des indicateurs clés agrégés pour la région */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
              Indicateurs clés — {year}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard label="Population totale" value={fmt(agg.population, 0)} unit="hab."
                badge={agg.densitePopulation ? `${fmt(agg.densitePopulation)} hab./km² (moy.)` : undefined} />
              <KpiCard label="Logements sociaux (moy.)" value={fmt(agg.tauxLogementsSociaux)} unit="%" badge="des résidences principales" />
              <KpiCard label="Taux de chômage T4 (moy.)" value={fmt(agg.tauxChomageT4)} unit="%" />
              <KpiCard label="Taux de pauvreté (moy.)" value={fmt(agg.tauxPauvrete)} unit="%" />
            </div>
          </section>

          {/* Section démographie avec moyennes régionales */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
              Démographie — {year}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard label="Moins de 20 ans (moy.)" value={fmt(agg.pourcentageMoins20Ans)} unit="%" />
              <KpiCard label="Plus de 60 ans (moy.)" value={fmt(agg.pourcentagePlus60Ans)} unit="%" />
              <KpiCard label="Solde naturel (moy.)" value={fmt(agg.contributionSoldeNaturel)} unit="%" badge="Contribution variation pop." />
              <KpiCard label="Solde migratoire (moy.)" value={fmt(agg.contributionSoldeMigratoire)} unit="%" badge="Contribution variation pop." />
            </div>
          </section>

          {/* Section logement avec totaux et moyennes régionales */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
              Logement — {year}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <KpiCard label="Nombre de logements" value={fmt(agg.nombreLogements, 0)} />
              <KpiCard label="Résidences principales" value={fmt(agg.nombreResidencesPrincipales, 0)} />
              <KpiCard label="Logements vacants (moy.)" value={fmt(agg.tauxLogementsVacants)} unit="%" />
            </div>
          </section>

          {/* Section évolution avec graphiques des moyennes régionales */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-4">
              Évolution 2021 – 2023
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique de l'évolution du taux de logements sociaux (moyenne régionale) */}
              {evolution.tauxLogementsSociaux.some((v) => v !== null) && (
                <div className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-widest">Taux de logements sociaux (moy.)</h3>
                    <div style={{ height: "180px" }} className="mt-3">
                      <Line data={makeLineChart(evolution.tauxLogementsSociaux, "rgba(43,171,136,1)")} options={lineOptions("%")} />
                    </div>
                  </div>
                </div>
              )}
              {/* Graphique de l'évolution du taux de chômage (moyenne régionale) */}
              {evolution.tauxChomageT4.some((v) => v !== null) && (
                <div className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-widest">Taux de chômage T4 (moy.)</h3>
                    <div style={{ height: "180px" }} className="mt-3">
                      <Line data={makeLineChart(evolution.tauxChomageT4, "rgba(251,146,60,1)")} options={lineOptions("%")} />
                    </div>
                  </div>
                </div>
              )}
              {/* Graphique de l'évolution du taux de pauvreté (moyenne régionale) */}
              {evolution.tauxPauvrete.some((v) => v !== null) && (
                <div className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-widest">Taux de pauvreté (moy.)</h3>
                    <div style={{ height: "180px" }} className="mt-3">
                      <Line data={makeLineChart(evolution.tauxPauvrete, "rgba(239,68,68,1)")} options={lineOptions("%")} />
                    </div>
                  </div>
                </div>
              )}
              {/* Graphique de l'évolution de la population totale */}
              {evolution.population.some((v) => v !== null) && (
                <div className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-widest">Population totale</h3>
                    <div style={{ height: "180px" }} className="mt-3">
                      <Line data={makeLineChart(evolution.population, "rgba(99,102,241,1)")} options={lineOptions("hab.")} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section détaillant les départements de la région */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
              Départements de la région — {year}
            </p>
            <div className="card bg-base-200 shadow">
              <div className="card-body p-0">
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    {/* En-tête du tableau des départements */}
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Département</th>
                        <th className="text-right">Population</th>
                        <th className="text-right">Log. sociaux</th>
                        <th className="text-right">Chômage T4</th>
                        <th className="text-right">Taux pauvreté</th>
                      </tr>
                    </thead>
                    {/* Corps du tableau avec tri alphabétique */}
                    <tbody>
                      {[...currentStats]
                        .sort((a, b) => (a.departement?.nom ?? '').localeCompare(b.departement?.nom ?? '', 'fr'))
                        .map(s => (
                          <tr key={s.id} className="hover">
                            {/* Colonne du code départemental */}
                            <td className="font-mono text-xs text-base-content/50 w-12">
                              {s.departement?.code}
                            </td>
                            {/* Colonne du nom avec lien vers la page détail du département */}
                            <td className="font-medium">
                              <Link to={`/departements/${s.departement?.code}`} className="link link-hover link-primary">
                                {s.departement?.nom}
                              </Link>
                            </td>
                            {/* Colonnes des statistiques individuelles du département */}
                            <td className="text-right font-mono text-sm">
                              {fmt(s.nombreHabitants, 0)}
                            </td>
                            <td className="text-right font-mono text-sm">
                              {s.tauxLogementsSociaux !== null ? (
                                <span className="font-semibold text-primary">
                                  {fmt(s.tauxLogementsSociaux)} %
                                </span>
                              ) : '—'} {/* Symbole pour valeur manquante */}
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
            </div>
          </section>
        </>
      )}
    </div>
  );
}

  // Rendu principal du composant
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* Fil d'Ariane pour la navigation */}
      <div className="text-sm breadcrumbs text-base-content/50">
        <ul>
          <li><Link to="/regions">Régions</Link></li>
          <li className="text-base-content">{region?.nom ?? code}</li>
        </ul>
      </div>

      {/* En-tête avec le code et le nom de la région */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge badge-outline badge-lg font-mono">{code}</span>
          <h1 className="text-2xl font-bold">{region?.nom ?? "…"}</h1>
        </div>
        <p className="text-base-content/50 text-sm mt-1">
          {/* Affichage du nombre de départements dans la région */}
          {region?.departements?.length ?? 0} département{(region?.departements?.length ?? 0) > 1 ? 's' : ''} — données {year}
        </p>
      </div>

      {/* Affichage conditionnel selon l'état des données */}
      {isLoading ? (
        // Indicateur de chargement
        <div className="flex justify-center py-24">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : currentStats.length === 0 ? (
        // Message d'avertissement si aucune donnée pour l'année sélectionnée
        <div className="alert alert-warning">
          <span>Aucune donnée disponible pour {year}.</span>
        </div>
      ) : (
        <>
          {/* Section des indicateurs clés agrégés pour la région */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
              Indicateurs clés — {year}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard label="Population totale" value={fmt(agg.population, 0)} unit="hab."
                badge={agg.densitePopulation ? `${fmt(agg.densitePopulation)} hab./km² (moy.)` : undefined} />
              <KpiCard label="Logements sociaux (moy.)" value={fmt(agg.tauxLogementsSociaux)} unit="%" badge="des résidences principales" />
              <KpiCard label="Taux de chômage T4 (moy.)" value={fmt(agg.tauxChomageT4)} unit="%" />
              <KpiCard label="Taux de pauvreté (moy.)" value={fmt(agg.tauxPauvrete)} unit="%" />
            </div>
          </section>

          {/* Section démographie avec moyennes régionales */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
              Démographie — {year}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard label="Moins de 20 ans (moy.)" value={fmt(agg.pourcentageMoins20Ans)} unit="%" />
              <KpiCard label="Plus de 60 ans (moy.)" value={fmt(agg.pourcentagePlus60Ans)} unit="%" />
              <KpiCard label="Solde naturel (moy.)" value={fmt(agg.contributionSoldeNaturel)} unit="%" badge="Contribution variation pop." />
              <KpiCard label="Solde migratoire (moy.)" value={fmt(agg.contributionSoldeMigratoire)} unit="%" badge="Contribution variation pop." />
            </div>
          </section>

          {/* Section logement avec totaux et moyennes régionales */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
              Logement — {year}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <KpiCard label="Nombre de logements" value={fmt(agg.nombreLogements, 0)} />
              <KpiCard label="Résidences principales" value={fmt(agg.nombreResidencesPrincipales, 0)} />
              <KpiCard label="Logements vacants (moy.)" value={fmt(agg.tauxLogementsVacants)} unit="%" />
            </div>
          </section>

          {/* Section évolution avec graphiques des moyennes régionales */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-4">
              Évolution 2021 – 2023
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique de l'évolution du taux de logements sociaux (moyenne régionale) */}
              {evolution.tauxLogementsSociaux.some((v) => v !== null) && (
                <div className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-widest">Taux de logements sociaux (moy.)</h3>
                    <div style={{ height: "180px" }} className="mt-3">
                      <Line data={makeLineChart(evolution.tauxLogementsSociaux, "rgba(43,171,136,1)")} options={lineOptions("%")} />
                    </div>
                  </div>
                </div>
              )}
              {/* Graphique de l'évolution du taux de chômage (moyenne régionale) */}
              {evolution.tauxChomageT4.some((v) => v !== null) && (
                <div className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-widest">Taux de chômage T4 (moy.)</h3>
                    <div style={{ height: "180px" }} className="mt-3">
                      <Line data={makeLineChart(evolution.tauxChomageT4, "rgba(251,146,60,1)")} options={lineOptions("%")} />
                    </div>
                  </div>
                </div>
              )}
              {/* Graphique de l'évolution du taux de pauvreté (moyenne régionale) */}
              {evolution.tauxPauvrete.some((v) => v !== null) && (
                <div className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-widest">Taux de pauvreté (moy.)</h3>
                    <div style={{ height: "180px" }} className="mt-3">
                      <Line data={makeLineChart(evolution.tauxPauvrete, "rgba(239,68,68,1)")} options={lineOptions("%")} />
                    </div>
                  </div>
                </div>
              )}
              {/* Graphique de l'évolution de la population totale */}
              {evolution.population.some((v) => v !== null) && (
                <div className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-widest">Population totale</h3>
                    <div style={{ height: "180px" }} className="mt-3">
                      <Line data={makeLineChart(evolution.population, "rgba(99,102,241,1)")} options={lineOptions("hab.")} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section détaillant les départements de la région */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
              Départements de la région — {year}
            </p>
            <div className="card bg-base-200 shadow">
              <div className="card-body p-0">
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    {/* En-tête du tableau des départements */}
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Département</th>
                        <th className="text-right">Population</th>
                        <th className="text-right">Log. sociaux</th>
                        <th className="text-right">Chômage T4</th>
                        <th className="text-right">Taux pauvreté</th>
                      </tr>
                    </thead>
                    {/* Corps du tableau avec tri alphabétique */}
                    <tbody>
                      {[...currentStats]
                        .sort((a, b) => (a.departement?.nom ?? '').localeCompare(b.departement?.nom ?? '', 'fr'))
                        .map(s => (
                          <tr key={s.id} className="hover">
                            {/* Colonne du code départemental */}
                            <td className="font-mono text-xs text-base-content/50 w-12">
                              {s.departement?.code}
                            </td>
                            {/* Colonne du nom avec lien vers la page détail du département */}
                            <td className="font-medium">
                              <Link to={`/departements/${s.departement?.code}`} className="link link-hover link-primary">
                                {s.departement?.nom}
                              </Link>
                            </td>
                            {/* Colonnes des statistiques individuelles du département */}
                            <td className="text-right font-mono text-sm">
                              {fmt(s.nombreHabitants, 0)}
                            </td>
                            <td className="text-right font-mono text-sm">
                              {s.tauxLogementsSociaux !== null ? (
                                <span className="font-semibold text-primary">
                                  {fmt(s.tauxLogementsSociaux)} %
                                </span>
                              ) : '—'} {/* Symbole pour valeur manquante */}
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
            </div>
          </section>
        </>
      )}
    </div>
  );

