import { Outlet, useSearchParams } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  // l'année est stockée dans l'URL (?annee=2023) pour pouvoir partager un lien avec le contexte
  const [searchParams, setSearchParams] = useSearchParams()
  const year = Number(searchParams.get('annee') ?? 2023)

  const setYear = (y) => setSearchParams(prev => {
    const next = new URLSearchParams(prev)
    next.set('annee', y)
    return next
  })

  return (
    // lg:drawer-open = sidebar toujours visible sur grand écran
    <div className="drawer lg:drawer-open">
      <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen">

        {/* barre du haut visible uniquement sur mobile avec le bouton burger */}
        <div className="navbar bg-base-200 border-b border-base-300 lg:hidden px-3 sticky top-0 z-30">
          <label htmlFor="sidebar-drawer" className="btn btn-ghost btn-sm drawer-button">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </label>
          <span className="font-bold ml-2 text-sm">DataViz Logement Social</span>
          <div className="ml-auto">
            <div className="badge badge-primary badge-outline badge-sm">{year}</div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ year }} />
        </main>
      </div>

      <div className="drawer-side z-40">
        <label htmlFor="sidebar-drawer" aria-label="Fermer le menu" className="drawer-overlay" />
        <Sidebar year={year} setYear={setYear} />
      </div>
    </div>
  )
}
