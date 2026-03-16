export default function PlaceholderPage({ title }) {
  return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="text-center space-y-2">
        <p className="text-2xl font-bold">{title}</p>
        <p className="text-base-content/50">Page à venir</p>
      </div>
    </div>
  )
}
