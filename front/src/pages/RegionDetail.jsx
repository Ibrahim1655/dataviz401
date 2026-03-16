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

const ANNEES = [2021, 2022, 2023];

export default function RegionDetail() {
  const { code } = useParams();
  const { year } = useOutletContext();

  const { data: region } = useQuery({
    queryKey: ["region", code],
    queryFn: () => fetchRegion(code),
    staleTime: 60 * 60 * 1000,
  });

  const queries = ANNEES.map((annee) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ["statistiques-region", code, annee],
      queryFn: () => fetchStatistiquesByRegion(code, { annee }),
      staleTime: 10 * 60 * 1000,
    })
  );

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const currentStats = queries[ANNEES.indexOf(year)]?.data ?? [];

  // agrégation des stats de l'année courante
  const agg = {
    population: currentStats.reduce((s, st) => s + (st.nombreHabitants ?? 0), 0),
    densitePopulation: avg(currentStats.map((st) => st.densitePopulation)),
    tauxLogementsSociaux: avg(currentStats.map((st) => st.tauxLogementsSociaux)),
    tauxChomageT4: avg(currentStats.map((st) => st.tauxChomageT4)),
    tauxPauvrete: avg(currentStats.map((st) => st.tauxPauvrete)),
    pourcentageMoins20Ans: avg(currentStats.map((st) => st.pourcentageMoins20Ans)),
    pourcentagePlus60Ans: avg(currentStats.map((st) => st.pourcentagePlus60Ans)),
    contributionSoldeNaturel: avg(currentStats.map((st) => st.contributionSoldeNaturel)),
    contributionSoldeMigratoire: avg(currentStats.map((st) => st.contributionSoldeMigratoire)),
    nombreLogements: currentStats.reduce((s, st) => s + (st.nombreLogements ?? 0), 0),
    nombreResidencesPrincipales: currentStats.reduce((s, st) => s + (st.nombreResidencesPrincipales ?? 0), 0),
    tauxLogementsVacants: avg(currentStats.map((st) => st.tauxLogementsVacants)),
  };

  // évolution par année
  const evolution = {
    tauxLogementsSociaux: ANNEES.map((_, i) => avg((queries[i]?.data ?? []).map((st) => st.tauxLogementsSociaux))),
    tauxChomageT4: ANNEES.map((_, i) => avg((queries[i]?.data ?? []).map((st) => st.tauxChomageT4))),
    tauxPauvrete: ANNEES.map((_, i) => avg((queries[i]?.data ?? []).map((st) => st.tauxPauvrete))),
    population: ANNEES.map((_, i) => (queries[i]?.data ?? []).reduce((s, st) => s + (st.nombreHabitants ?? 0), 0) || null),
  };

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

  const lineOptions = (unit) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${fmt(ctx.parsed.y)} ${unit}` } } },
    scales: {
      x: { grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#9ca3af" } },
      y: { grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#9ca3af", callback: (v) => `${v} ${unit}` } },
    },
  });

  if (isError) {
    return (
      <div className="p-8">
        <div className="alert alert-error">
          <span>Impossible de charger les données pour cette région.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      <div className="text-sm breadcrumbs text-base-content/50">
        <ul>
          <li><Link to="/regions">Régions</Link></li>
          <li className="text-base-content">{region?.nom ?? code}</li>
        </ul>
      </div>

      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge badge-outline badge-lg font-mono">{code}</span>
          <h1 className="text-2xl font-bold">{region?.nom ?? "…"}</h1>
        </div>
        <p className="text-base-content/50 text-sm mt-1">
          {region?.departements?.length ?? 0} département{(region?.departements?.length ?? 0) > 1 ? 's' : ''} — données {year}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : currentStats.length === 0 ? (
        <div className="alert alert-warning">
          <span>Aucune donnée disponible pour {year}.</span>
        </div>
      ) : (
        <>
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

          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-4">
              Évolution 2021 – 2023
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
              Départements de la région — {year}
            </p>
            <div className="card bg-base-200 shadow">
              <div className="card-body p-0">
                <div className="overflow-x-auto">
                  <table className="table table-sm">
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
                    <tbody>
                      {[...currentStats]
                        .sort((a, b) => (a.departement?.nom ?? '').localeCompare(b.departement?.nom ?? '', 'fr'))
                        .map(s => (
                          <tr key={s.id} className="hover">
                            <td className="font-mono text-xs text-base-content/50 w-12">
                              {s.departement?.code}
                            </td>
                            <td className="font-medium">
                              <Link to={`/departements/${s.departement?.code}`} className="link link-hover link-primary">
                                {s.departement?.nom}
                              </Link>
                            </td>
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
            </div>
          </section>
        </>
      )}
    </div>
  );
}
