import { NavLink, Outlet, useSearchParams } from 'react-router-dom'

// les années disponibles dans notre dataset
const YEARS = [2021, 2022, 2023]

// liste des pages de l'application avec leurs icones SVG (récupérées sur heroicons.com)
const NAV = [
  {
    to: '/',
    label: 'Accueil',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/regions',
    label: 'Régions',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    to: '/departements',
    label: 'Départements',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    to: '/comparateur',
    label: 'Comparateur',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

// composant de la barre latérale, on lui passe l'année sélectionnée et la fonction pour la changer
function Sidebar({ year, setYear }) {
  return (
    <aside className="bg-base-200 w-64 min-h-full flex flex-col border-r border-base-300">

      {/* titre en haut de la sidebar */}
      <div className="px-6 py-5 border-b border-base-300">
        <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-1">Observatoire</p>
        <span className="font-bold text-base leading-tight">DataViz Logement Social</span>
      </div>

      {/* menu de navigation, NavLink gère automatiquement la classe "active" */}
      <nav className="flex-1 px-3 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 px-3 mb-2">Navigation</p>
        <ul className="menu menu-md gap-0.5 p-0">
          {NAV.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}  // end=true pour que "/" ne soit pas actif sur toutes les pages
                className={({ isActive }) =>
                  isActive ? 'active font-medium' : 'font-medium'
                }
              >
                {icon}
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* sélecteur d'année en bas de la sidebar */}
      <div className="px-4 py-5 border-t border-base-300">
        <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
          Année de référence
        </p>
        {/* join = groupe de boutons collés ensemble (composant daisyUI) */}
        <div className="join w-full">
          {YEARS.map(y => (
            <button
              key={y}
              className={`join-item btn btn-sm flex-1 ${y === year ? 'btn-primary' : 'btn-ghost border-base-300'}`}
              onClick={() => setYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

// layout principal de l'application
// le drawer de daisyUI permet d'avoir une sidebar fixe sur desktop et un menu burger sur mobile
export default function Layout() {
  // on stocke l'année dans l'URL (?annee=2023) plutôt que dans un state
  // comme ça si on partage le lien l'année est conservée
  const [searchParams, setSearchParams] = useSearchParams()
  const year = Number(searchParams.get('annee') ?? 2023)

  // quand on change l'année on met à jour l'URL sans effacer les autres paramètres
  const setYear = (y) => setSearchParams(prev => {
    const next = new URLSearchParams(prev)
    next.set('annee', y)
    return next
  })

  return (
    // lg:drawer-open = sidebar toujours visible sur grand écran
    <div className="drawer lg:drawer-open">
      <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />

      {/* zone de contenu principale (à droite de la sidebar) */}
      <div className="drawer-content flex flex-col min-h-screen">

        {/* barre du haut visible uniquement sur mobile avec le bouton burger */}
        <div className="navbar bg-base-200 border-b border-base-300 lg:hidden px-3 sticky top-0 z-30">
          <label htmlFor="sidebar-drawer" className="btn btn-ghost btn-sm drawer-button">
            {/* icone hamburger */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </label>
          <span className="font-bold ml-2 text-sm">DataViz Logement Social</span>
          <div className="ml-auto">
            <div className="badge badge-primary badge-outline badge-sm">{year}</div>
          </div>
        </div>

        {/* Outlet = endroit où React Router va afficher la page courante */}
        {/* on passe l'année en contexte pour que toutes les pages y aient accès */}
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ year }} />
        </main>
      </div>

      {/* sidebar (drawer-side) */}
      <div className="drawer-side z-40">
        {/* l'overlay permet de fermer la sidebar en cliquant à côté sur mobile */}
        <label htmlFor="sidebar-drawer" aria-label="Fermer le menu" className="drawer-overlay" />
        <Sidebar year={year} setYear={setYear} />
      </div>
    </div>
  )
}
