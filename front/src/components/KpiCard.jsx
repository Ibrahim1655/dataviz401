export default function KpiCard({ label, value, unit, badge }) {
  return (
    <div className="card bg-base-200 shadow">
      <div className="card-body gap-1 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-base-content/50">{label}</p>
        <p className="text-3xl font-bold text-primary">
          {value}
          {unit && <span className="text-lg font-normal text-base-content/40 ml-1">{unit}</span>}
        </p>
        {badge && <div className="badge badge-outline badge-sm mt-1">{badge}</div>}
      </div>
    </div>
  )
}
