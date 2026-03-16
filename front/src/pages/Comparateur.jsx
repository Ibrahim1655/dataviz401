import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Bar, Line } from "react-chartjs-2";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

const ANNEES = [2021, 2022, 2023];
const MAX_DEPT = 4;

const PALETTE = [
  "rgba(43,171,136,1)",
  "rgba(99,102,241,1)",
  "rgba(251,146,60,1)",
  "rgba(239,68,68,1)",
];

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

const INDICATEURS_LINE = [
  { key: "tauxLogementsSociaux", label: "Logements sociaux", unit: "%" },
  { key: "tauxChomageT4", label: "Chômage T4", unit: "%" },
  { key: "tauxPauvrete", label: "Pauvreté", unit: "%" },
  { key: "nombreHabitants", label: "Population", unit: "hab." },
  { key: "densitePopulation", label: "Densité", unit: "hab./km²" },
  { key: "tauxLogementsVacants", label: "Logements vacants", unit: "%" },
];

export default function Comparateur() {
  const { year } = useOutletContext();
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [indicateur, setIndicateur] = useState("tauxLogementsSociaux");

  // ── Partie 1 : données de sélection ─────────────────────────────────────

  const { data: regions = [] } = useQuery({
    queryKey: ["regions"],
    queryFn: fetchRegions,
    staleTime: 60 * 60 * 1000,
  });

  const { data: departements = [] } = useQuery({
    queryKey: ["departements", selectedRegion],
    queryFn: () =>
      fetchDepartements(selectedRegion ? { region: selectedRegion } : {}),
    staleTime: 60 * 60 * 1000,
  });

  const addDept = (dept) => {
    if (selectedDepts.length >= MAX_DEPT) return;
    if (selectedDepts.find((d) => d.code === dept.code)) return;
    setSelectedDepts([...selectedDepts, { code: dept.code, nom: dept.nom }]);
  };

  const removeDept = (code) =>
    setSelectedDepts(selectedDepts.filter((d) => d.code !== code));
}
