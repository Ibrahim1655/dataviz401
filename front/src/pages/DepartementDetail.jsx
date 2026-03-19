// Import 
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
import { fetchStatistiques, fetchDepartement } from "../api/api";
import KpiCard from "../components/KpiCard";
import { fmt } from "../utils/format";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

// Définition des années pour lesquelles nous avons des données
const ANNEES = [2021, 2022, 2023];

// Composant principal pour afficher les détails d'un département
export default function DepartementDetail() {
  // Récupération du code du département depuis les paramètres d'URL
  const { code } = useParams();
  // Récupération de l'année sélectionnée depuis le contexte du layout
  const { year } = useOutletContext();

  // Requête pour récupérer les informations du département
  const { data: dept } = useQuery({
    queryKey: ["departement", code],
    queryFn: () => fetchDepartement(code),
    staleTime: 60 * 60 * 1000, // Cache valide pendant 1 heure
  });

  // Création de requêtes pour chaque année afin de récupérer les statistiques
  const queries = ANNEES.map((annee) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ["statistiques", { annee, departement: code }],
      queryFn: () => fetchStatistiques({ annee, departement: code }),
      staleTime: 10 * 60 * 1000, // Cache valide pendant 10 minutes
    })
  );

  // Vérification si les données sont en cours de chargement ou s'il y a une erreur
  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  // Récupération des statistiques pour l'année actuelle
  const statsCurrent = queries[ANNEES.indexOf(year)]?.data?.[0] ?? null;

  // Construction des données d'évolution pour les graphiques
  const evolution = {
    tauxLogementsSociaux: ANNEES.map((_, i) => queries[i]?.data?.[0]?.tauxLogementsSociaux ?? null),
    tauxChomageT4: ANNEES.map((_, i) => queries[i]?.data?.[0]?.tauxChomageT4 ?? null),
    tauxPauvrete: ANNEES.map((_, i) => queries[i]?.data?.[0]?.tauxPauvrete ?? null),
    nombreHabitants: ANNEES.map((_, i) => queries[i]?.data?.[0]?.nombreHabitants ?? null),
  };

  // Fonction pour créer la configuration des graphiques en ligne
  const makeLineChart = (data, color) => ({
    labels: ANNEES,
    datasets: [{
      data,
      borderColor: color,
      backgroundColor: color + "20", 
      borderWidth: 2,
      pointRadius: 4,
      tension: 0.3, 
      fill: true, 
    }],
  });

  // Configuration des options pour les graphiques en ligne
  const lineOptions = (unit) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Masquer 
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${fmt(ctx.parsed.y)} ${unit}` // Formatage des tooltips
        }
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.06)" }, 
        ticks: { color: "#9ca3af" } 
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

  // Informations du département (priorité aux données de dept, sinon de statsCurrent)
  const deptInfo = dept ?? statsCurrent?.departement;

  // Affichage d'une erreur si les données n'ont pas pu être chargées
  if (isError) {
    return (
      <div className="p-8">
        <div className="alert alert-error">
          <span>Impossible de charger les données pour ce département.</span>
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
          <li><Link to="/departements">Départements</Link></li>
          <li className="text-base-content">{deptInfo?.nom ?? code}</li>
        </ul>
      </div>

      {/* En-tête avec le code et le nom du département */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge badge-outline badge-lg font-mono">{code}</span>
          <h1 className="text-2xl font-bold">{deptInfo?.nom ?? "…"}</h1>
        </div>
        <p className="text-base-content/50 text-sm mt-1">
          {deptInfo?.region?.nom ?? ""} — données {year}
        </p>
      </div>

      {/* Affichage conditionnel selon l'état des données */}
      {isLoading ? (
        // Indicateur de chargement
        <div className="flex justify-center py-24">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : statsCurrent === null ? (
        // Message d'avertissement si aucune donnée pour l'année sélectionnée
        <div className="alert alert-warning">
          <span>Aucune donnée disponible pour {year}.</span>
        </div>
      ) : (
        <>
          {/* Section des indicateurs clés */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
              Indicateurs clés — {year}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard label="Population" value={fmt(statsCurrent.nombreHabitants, 0)} unit="hab."
                badge={statsCurrent.densitePopulation ? `${fmt(statsCurrent.densitePopulation)} hab./km²` : undefined} />
              <KpiCard label="Logements sociaux" value={fmt(statsCurrent.tauxLogementsSociaux)} unit="%" badge="des résidences principales" />
              <KpiCard label="Taux de chômage T4" value={fmt(statsCurrent.tauxChomageT4)} unit="%" />
              <KpiCard label="Taux de pauvreté" value={fmt(statsCurrent.tauxPauvrete)} unit="%" />
            </div>
          </section>

          {/* Section démographie */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
              Démographie — {year}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard label="Moins de 20 ans" value={fmt(statsCurrent.pourcentageMoins20Ans)} unit="%" />
              <KpiCard label="Plus de 60 ans" value={fmt(statsCurrent.pourcentagePlus60Ans)} unit="%" />
              <KpiCard label="Solde naturel" value={fmt(statsCurrent.contributionSoldeNaturel)} unit="%" badge="Contribution variation pop." />
              <KpiCard label="Solde migratoire" value={fmt(statsCurrent.contributionSoldeMigratoire)} unit="%" badge="Contribution variation pop." />
            </div>
          </section>

          {/* Section logement */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
              Logement — {year}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <KpiCard label="Nombre de logements" value={fmt(statsCurrent.nombreLogements, 0)} />
              <KpiCard label="Résidences principales" value={fmt(statsCurrent.nombreResidencesPrincipales, 0)} />
              <KpiCard label="Logements vacants" value={fmt(statsCurrent.tauxLogementsVacants)} unit="%" />
            </div>
          </section>

          {/* Section évolution avec graphiques */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-4">
              Évolution 2021 – 2023
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique du taux de logements sociaux */}
              {evolution.tauxLogementsSociaux.some((v) => v !== null) && (
                <div className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-widest">Taux de logements sociaux</h3>
                    <div style={{ height: "180px" }} className="mt-3">
                      <Line data={makeLineChart(evolution.tauxLogementsSociaux, "rgba(43,171,136,1)")} options={lineOptions("%")} />
                    </div>
                  </div>
                </div>
              )}
              {/* Graphique du taux de chômage */}
              {evolution.tauxChomageT4.some((v) => v !== null) && (
                <div className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-widest">Taux de chômage T4</h3>
                    <div style={{ height: "180px" }} className="mt-3">
                      <Line data={makeLineChart(evolution.tauxChomageT4, "rgba(251,146,60,1)")} options={lineOptions("%")} />
                    </div>
                  </div>
                </div>
              )}
              {/* Graphique du taux de pauvreté */}
              {evolution.tauxPauvrete.some((v) => v !== null) && (
                <div className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-widest">Taux de pauvreté</h3>
                    <div style={{ height: "180px" }} className="mt-3">
                      <Line data={makeLineChart(evolution.tauxPauvrete, "rgba(239,68,68,1)")} options={lineOptions("%")} />
                    </div>
                  </div>
                </div>
              )}
              {/* Graphique de la population */}
              {evolution.nombreHabitants.some((v) => v !== null) && (
                <div className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-widest">Population</h3>
                    <div style={{ height: "180px" }} className="mt-3">
                      <Line data={makeLineChart(evolution.nombreHabitants, "rgba(99,102,241,1)")} options={lineOptions("hab.")} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
