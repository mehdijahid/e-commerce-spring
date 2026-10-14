import './Sidebar.css'

export type AdminView = 'dashboard' | 'formations' | 'courses' | 'users' | 'avis'

interface SidebarLink {
  icon: React.ReactNode
  label: string
  view: AdminView
}

interface SidebarProps {
  logo: string
  activeView: AdminView
  onNavigate: (view: AdminView) => void
  onLogout: () => void
}

const SIDEBAR_LINKS: SidebarLink[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
    label: 'Dashboard',
    view: 'dashboard',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <path d="M4 19V5a2 2 0 012-2h13v16" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 19a2 2 0 002 2h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    label: 'Formations',
    view: 'formations',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    label: 'Courses',
    view: 'courses',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 4.5a3.5 3.5 0 010 7M18 15c2 0 3 1.2 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    label: 'Utilisateurs',
    view: 'users',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Avis',
    view: 'avis',
  },
]

export default function Sidebar({ logo, activeView, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <img src={logo} alt="Logo EduForm" className="sidebar-logo" />
      <nav className="sidebar-nav">
        {SIDEBAR_LINKS.map((link) => (
          <button
            key={link.view}
            type="button"
            className={`sidebar-link${activeView === link.view ? ' sidebar-link-active' : ''}`}
            onClick={() => onNavigate(link.view)}
          >
            {link.icon}
            {link.label}
          </button>
        ))}
      </nav>
      <button type="button" className="sidebar-logout" onClick={onLogout}>
        Déconnexion
      </button>
    </aside>
  )
}
