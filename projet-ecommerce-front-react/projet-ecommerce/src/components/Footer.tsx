import type { ReactNode } from 'react'
import './Footer.css'
import type { Formation } from '../services/api'

interface FooterProps {
  formations?: Formation[]
}

const SOCIALS: { name: string; href: string; icon: ReactNode }[] = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com',
    icon: (
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.09 24 12.07z" />
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com',
    icon: (
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43c-1.15 0-2.08-.93-2.08-2.08s.93-2.08 2.08-2.08c1.15 0 2.08.93 2.08 2.08s-.93 2.08-2.08 2.08zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.72C24 .77 23.23 0 22.23 0z" />
    ),
  },
  {
    name: 'Twitter',
    href: 'https://www.twitter.com',
    icon: (
      <path d="M23.95 4.57a9.6 9.6 0 01-2.76.76 4.83 4.83 0 002.12-2.66 9.6 9.6 0 01-3.05 1.16 4.8 4.8 0 00-8.18 4.38A13.62 13.62 0 011.64 3.16a4.8 4.8 0 001.48 6.4 4.8 4.8 0 01-2.18-.6v.06a4.8 4.8 0 003.85 4.7 4.8 4.8 0 01-2.17.08 4.81 4.81 0 004.5 3.34A9.65 9.65 0 010 19.55a13.6 13.6 0 007.37 2.16c8.85 0 13.68-7.33 13.68-13.68 0-.21 0-.42-.01-.62a9.8 9.8 0 002.9-3.84z" />
    ),
  },
]

const DEFAULT_LINK_GROUPS: { title: string; links: string[] }[] = [
  {
    title: 'Formation',
    links: ['Développement Web', 'Data Science', 'Marketing Digital', 'Design'],
  },
  {
    title: 'À propos',
    links: ["Qui sommes-nous ?", 'Nos valeurs', 'Nos instructeurs', 'Carrières'],
  },
  {
    title: 'Support',
    links: ["Centre d'aide", 'FAQ', 'Nous contacter', "Guide de l'apprenant"],
  },
  {
    title: 'Ressources',
    links: ['Blog', 'Tutoriels gratuits', 'Webinaires', 'Outils et modèles'],
  },
]

export default function Footer({ formations = [] }: FooterProps) {
  const formationLinks = formations.slice(0, 4).map((f) => f.title)
  const groups = DEFAULT_LINK_GROUPS.map((group) =>
    group.title === 'Formation' && formationLinks.length > 0
      ? { ...group, links: formationLinks }
      : group,
  )

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <img src="/siteweb-logo.png" alt="Logo EduForm" />
          <p>
            Apprendre de nouvelles compétences et développer votre carrière grâce à des
            formations de qualité.
          </p>
          <div className="footer-social">
            {SOCIALS.map((social) => (
              <a key={social.name} href={social.href} target="_blank" rel="noreferrer" aria-label={social.name}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                  {social.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="footer-links">
          {groups.map((group) => (
            <div className="footer-links-column" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="#">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <p>Apprendre aujourd'hui, réussir demain</p>
        <span>&copy; 2026 EduForm. Tous droits réservés.</span>
      </div>
    </footer>
  )
}
