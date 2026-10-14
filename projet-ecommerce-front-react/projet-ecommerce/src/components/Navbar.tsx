import { useEffect, useRef, useState } from 'react'
import './Navbar.css'

interface NavbarProps {
  userName: string
  onLogout: () => void
  isAdmin?: boolean
  onGoAdmin?: () => void
  onGoHome?: () => void
  onGoMyFormations?: () => void
  onGoAccount?: () => void
}

export default function Navbar({
  userName,
  onLogout,
  isAdmin = false,
  onGoAdmin,
  onGoHome,
  onGoMyFormations,
  onGoAccount,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function run(action?: () => void) {
    setMenuOpen(false)
    action?.()
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/siteweb-logo.png" alt="Logo EduForm" />
      </div>

      <ul className="navbar-links">
        <li>
          <button type="button" className="navbar-link navbar-link-btn" onClick={() => run(onGoHome)}>
            Accueil
          </button>
        </li>
        <li>
          <button type="button" className="navbar-link navbar-link-btn" onClick={() => run(onGoMyFormations)}>
            Mes formations
          </button>
        </li>
        <li>
          <a className="navbar-link" href="#formation">
            Formation
          </a>
        </li>
        <li>
          <a className="navbar-link" href="#categorie">
            Catégorie
          </a>
        </li>
        <li>
          <a className="navbar-link" href="#contact">
            Contact
          </a>
        </li>
        {isAdmin && (
          <li>
            <button type="button" className="navbar-admin" onClick={() => run(onGoAdmin)}>
              Admin
            </button>
          </li>
        )}
      </ul>

      <div className="navbar-user" ref={menuRef}>
        <button
          type="button"
          className="navbar-user-btn"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar-user-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <circle cx="12" cy="8" r="3.5" stroke="#fff" strokeWidth="1.6" />
              <path d="M4.5 20c0-3.3 3.1-5 7.5-5s7.5 1.7 7.5 5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <span className="navbar-user-name">{userName}</span>
        </button>

        {menuOpen && (
          <div className="navbar-menu" role="menu">
            <button type="button" className="navbar-menu-item" role="menuitem" onClick={() => run(onGoAccount)}>
              Gérer mon compte
            </button>
            <button
              type="button"
              className="navbar-menu-item navbar-menu-item-danger"
              role="menuitem"
              onClick={() => run(onLogout)}
            >
              Déconnecter
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
