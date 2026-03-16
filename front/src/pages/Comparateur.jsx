// page du comparateur - permet de comparer plusieurs départements entre eux
// c'est la page la plus complexe du projet donc j'ai essayé de bien organiser

import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Bar, Line } from "react-chartjs-2"; // Line on l'utilisera plus tard pour l'évolution
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchRegions, fetchDepartements, fetchStatistiques } from "../api/api";
import { fmt } from "../utils/format";

// il faut enregistrer les composants chart.js sinon ça marche pas (j'ai eu l'erreur)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

// les 3 années disponibles dans la BDD
const ANNEES = [2021, 2022, 2023];
// on limite à 4 départements max pour que le graphique reste lisible
const MAX_DEPT = 4;

// couleurs pour chaque département (1 couleur par dept)
const PALETTE = [
  "rgba(43,171,136,1)",  // vert
  "rgba(99,102,241,1)",  // violet
  "rgba(251,146,60,1)",  // orange
  "rgba(239,68,68,1)",   // rouge
];

// liste de tous les indicateurs qu'on peut comparer
// decimals c'est pour l'affichage (population = entier, taux = 1 décimale)
const KPIS = [
  { key: "nombreHabitants", label: "Population", unit: "hab.", decimals: 0 },
  { key: "densitePopulation", label: "Densité", unit: "hab./km²" },
  { key: "tauxLogementsSociaux", label: "Logements sociaux", unit: "%" },
  { key: "tauxLogementsVacants", label: "Logements vacants", unit: "%" },
  { key: "nombreLogements", label: "Nb. logements", unit: "", decimals: 0 },
  {
    key: "nombreResidencesPrincipales",
    label: "Résidences principales",
    unit: "",
    decimals: 0,
  },
  { key: "tauxChomageT4", label: "Chômage T4", unit: "%" },
  { key: "tauxPauvrete", label: "Pauvreté", unit: "%" },
  { key: "pourcentageMoins20Ans", label: "Moins de 20 ans", unit: "%" },
  { key: "pourcentagePlus60Ans", label: "Plus de 60 ans", unit: "%" },
];

// indicateurs pour le graphique en ligne (évolution dans le temps)
// TODO : utiliser ça quand on fera la partie évolution
const INDICATEURS_LINE = [
  { key: "tauxLogementsSociaux", label: "Logements sociaux", unit: "%" },
  { key: "tauxChomageT4", label: "Chômage T4", unit: "%" },
  { key: "tauxPauvrete", label: "Pauvreté", unit: "%" },
  { key: "nombreHabitants", label: "Population", unit: "hab." },
  { key: "densitePopulation", label: "Densité", unit: "hab./km²" },
  { key: "tauxLogementsVacants", label: "Logements vacants", unit: "%" },
];

export default function Comparateur() {
  // year vient du layout global (le filtre en haut de page)
  const { year } = useOutletContext();

  // état local : région filtrée, depts sélectionnés, indicateur affiché
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [indicateur, setIndicateur] = useState("tauxLogementsSociaux"); // valeur par défaut

  // ── Partie 1 : récupération des listes pour les selects ─────────────────

  // on charge toutes les régions pour le filtre
  const { data: regions = [] } = useQuery({
    queryKey: ["regions"],
    queryFn: fetchRegions,
    staleTime: 60 * 60 * 1000, // 1h de cache, les régions changent pas
  });

  // on recharge les départements quand la région change
  // si pas de région sélectionnée on prend tous les départements
  const { data: departements = [] } = useQuery({
    queryKey: ["departements", selectedRegion],
    queryFn: () =>
      fetchDepartements(selectedRegion ? { region: selectedRegion } : {}),
    staleTime: 60 * 60 * 1000,
  });

  // ajoute un département à la sélection
  // vérifie qu'on dépasse pas MAX_DEPT et qu'il est pas déjà dedans
  const addDept = (dept) => {
    if (selectedDepts.length >= MAX_DEPT) return;
    if (selectedDepts.find((d) => d.code === dept.code)) return; // doublon
    setSelectedDepts([...selectedDepts, { code: dept.code, nom: dept.nom }]);
  };

  // supprime un département (le × sur les chips)
  const removeDept = (code) =>
    setSelectedDepts(selectedDepts.filter((d) => d.code !== code));

  // ── Partie 2 : stats pour chaque département sélectionné ────────────────

  // useQueries permet de lancer plusieurs requêtes en parallèle
  // une requête par département sélectionné, c'est plus efficace qu'une boucle
  const statsQueries = useQueries({
    queries: selectedDepts.map((d) => ({
      queryKey: ["statistiques", d.code],
      queryFn: () => fetchStatistiques({ departement: d.code }),
      staleTime: 60 * 60 * 1000,
      enabled: !!d.code, // on lance la requête seulement si on a bien un code
    })),
  });

  // on construit un objet { code: [stats] } pour accéder facilement aux données
  // ex: statsParDept["75"] = [{ annee: 2021, ... }, { annee: 2022, ... }, ...]
  const statsParDept = selectedDepts.reduce((acc, dept, i) => {
    acc[dept.code] = statsQueries[i]?.data ?? []; // tableau vide si pas encore chargé
    return acc;
  }, {});

  // helper pour récupérer la stat d'un dept pour une année précise
  const getStat = (code, annee) =>
    statsParDept[code]?.find((s) => s.anneePublication === annee) ?? null;

  // ── Partie 3 : construction des données pour le bar chart ────────────────

  // on cherche l'objet KPI correspondant à l'indicateur sélectionné
  const kpiActif = KPIS.find((k) => k.key === indicateur) ?? KPIS[0];

  // format attendu par chart.js pour un bar chart
  const barData = {
    labels: selectedDepts.map((d) => d.nom), // noms des depts en abscisse
    datasets: [
      {
        label: `${kpiActif.label} (${year})`,
        data: selectedDepts.map((d) => {
          const s = getStat(d.code, year);
          return s ? s[kpiActif.key] : null; // null si donnée absente
        }),
        backgroundColor: PALETTE.slice(0, selectedDepts.length), // 1 couleur par barre
        borderRadius: 6,
      },
    ],
  };

  // options du graphique (responsive, tooltip custom, unité sur l'axe Y)
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }, // inutile ici car 1 seul dataset
      tooltip: {
        callbacks: {
          // on affiche l'unité dans le tooltip
          label: (ctx) =>
            ctx.raw !== null
              ? `${fmt(ctx.raw, kpiActif.decimals ?? 1)} ${kpiActif.unit}`
              : "Donnée indisponible",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          // même chose sur l'axe Y
          callback: (v) => `${fmt(v, kpiActif.decimals ?? 1)} ${kpiActif.unit}`,
        },
      },
    },
  };

  // true si au moins une requête est encore en cours
  const isLoading = statsQueries.some((q) => q.isLoading);

  // ── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Comparateur</h1>

      {/* bloc de sélection des départements */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">
          Ajouter des départements{" "}
          <span className="text-sm font-normal text-gray-400">
            (max {MAX_DEPT})
          </span>
        </h2>

        <div className="flex gap-3 flex-wrap">
          {/* filtre par région pour réduire la liste de départements */}
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="">Toutes les régions</option>
            {regions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.nom}
              </option>
            ))}
          </select>

          {/* select pour choisir un département à ajouter */}
          {/* on remet la valeur à "" après chaque sélection pour pouvoir re-sélectionner */}
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 flex-1 min-w-40"
            disabled={selectedDepts.length >= MAX_DEPT}
            onChange={(e) => {
              const dept = departements.find((d) => d.code === e.target.value);
              if (dept) addDept(dept);
              e.target.value = ""; // reset du select
            }}
            value=""
          >
            <option value="" disabled>
              Choisir un département…
            </option>
            {/* on filtre les depts déjà sélectionnés pour pas les afficher */}
            {departements
              .filter((d) => !selectedDepts.find((s) => s.code === d.code))
              .map((d) => (
                <option key={d.code} value={d.code}>
                  {d.nom} ({d.code})
                </option>
              ))}
          </select>
        </div>

        {/* chips des départements sélectionnés, avec la couleur du graphique */}
        {selectedDepts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedDepts.map((d, i) => (
              <span
                key={d.code}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: PALETTE[i] }} // même couleur que dans le graphique
              >
                {d.nom}
                {/* bouton × pour retirer le département */}
                <button
                  onClick={() => removeDept(d.code)}
                  className="opacity-75 hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* graphique comparatif en barres - s'affiche seulement si on a des depts */}
      {selectedDepts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold text-gray-700">
              Comparaison — {year}
            </h2>
            {/* select pour changer l'indicateur à comparer */}
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={indicateur}
              onChange={(e) => setIndicateur(e.target.value)}
            >
              {KPIS.map((k) => (
                <option key={k.key} value={k.key}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>

          {/* affiche un message pendant le chargement */}
          {isLoading ? (
            <p className="text-gray-400 text-sm">Chargement…</p>
          ) : (
            <Bar data={barData} options={barOptions} />
          )}
        </div>
      )}

      {/* message si aucun département sélectionné */}
      {selectedDepts.length === 0 && (
        <p className="text-center text-gray-400 py-16">
          Sélectionnez au moins un département pour commencer.
        </p>
      )}
    </div>
  );
}
