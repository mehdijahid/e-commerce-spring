import { useState } from 'react'
import './Home.css'
import StarRating from '../components/StarRating'
import type { Formation } from '../services/api'
import { rateFormation, AuthError } from '../services/api'

const IMAGE_SRC = encodeURI('/ChatGPT Image 15 août 2026, 13_23_40.png')

interface HomeProps {
  formations: Formation[]
  loading: boolean
  error: string | null
  onSelectFormation: (id: number) => void
  onRefresh: () => void
  onAuthError: () => void
}

const FEATURES = [
  {
    title: 'Apprentissage fiable',
    text: 'Des parcours structurés et vérifiés par des experts qualifiés du domaine.',
    color: '#4f46e5',
    bg: 'rgba(79, 70, 229, 0.1)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M12 2l7 3v6c0 5-3 8.5-7 10-4-1.5-7-5-7-10V5l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M8.5 12l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Contenu de qualité',
    text: 'Des ressources actualisées et pensées pour la pratique quotidienne et professionnelle.',
    color: '#16a34a',
    bg: 'rgba(22, 163, 74, 0.1)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M12 2l2.4 4.9 5.6.8-4 3.9.9 5.4-4.9-2.6-4.9 2.6.9-5.4-4-3.9 5.6-.8L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Instructeurs experts',
    text: 'Apprenez auprès de professionnels passionnés et expérimentés du secteur.',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.2l7.1-.6L12 2z" />
      </svg>
    ),
  },
]

export default function Home({ formations, loading, error, onSelectFormation, onRefresh, onAuthError }: HomeProps) {
  const [pendingId, setPendingId] = useState<number | null>(null)

  async function handleRateFormation(id: number, rating: number) {
    setPendingId(id)
    try {
      await rateFormation(id, rating)
      onRefresh()
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthError()
      }
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-blobs" aria-hidden="true">
          <span className="home-blob home-blob-1" />
          <span className="home-blob home-blob-2" />
          <span className="home-floating home-floating-1">
            <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
              <path d="M12 3l8 5-8 5-8-5 8-5z" stroke="#4f46e5" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M4 12l8 5 8-5" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="home-floating home-floating-2">
            <svg viewBox="0 0 24 24" fill="#7c3aed" width="26" height="26">
              <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.2l7.1-.6L12 2z" />
            </svg>
          </span>
          <span className="home-floating home-floating-3">
            <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
              <circle cx="12" cy="12" r="9" stroke="#4f46e5" strokeWidth="1.5" />
              <path d="M8 12l3 3 5-6" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <div className="home-hero-top">
          <div className="home-hero-left">
            <h1>Apprenez, Progressez, <br /><span className='text-isolé'>Réussissez</span></h1>
            <p className="home-hero-subtitle">
              Des formations en ligne de qualité pour développer vos compétences et atteindre
              vos objectifs professionnels.
            </p>

            <form className="home-search" onSubmit={(e) => e.preventDefault()}>
              <input
                type="search"
                placeholder="Rechercher une formation…"
                aria-label="Rechercher une formation"
              />
              <button type="submit">Rechercher</button>
            </form>

            <div className="home-stats">
              <div className="home-stat">
                <span className="home-stat-icon stat-book">
                  <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                    <path d="M4 19V5a2 2 0 012-2h13v16" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M4 19a2 2 0 002 2h13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <div className="home-stat-body">
                  <strong>+500</strong>
                  <span>Formations</span>
                </div>
              </div>

              <div className="home-stat">
                <span className="home-stat-icon stat-star">
                  <svg viewBox="0 0 24 24" fill="#fff" width="24" height="24">
                    <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.2l7.1-.6L12 2z" />
                  </svg>
                </span>
                <div className="home-stat-body">
                  <strong>4.8/5</strong>
                  <span>Étoiles</span>
                </div>
              </div>

              <div className="home-stat">
                <span className="home-stat-icon stat-users">
                  <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                    <circle cx="9" cy="8" r="3.5" stroke="#fff" strokeWidth="1.6" />
                    <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M16 4.5a3.5 3.5 0 010 7M18 15c2 0 3 1.2 3 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <div className="home-stat-body">
                  <strong>+50</strong>
                  <span>Utilisateurs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="home-hero-right">
            <img src={IMAGE_SRC} alt="Illustration d'apprentissage en ligne" />
          </div>
        </div>

        <div className="home-features">
          {FEATURES.map((feature) => (
            <div className="home-feature" key={feature.title}>
              <span
                className="home-feature-icon"
                style={{ color: feature.color, background: feature.bg }}
              >
                {feature.icon}
              </span>
              <div>
                <strong>{feature.title}</strong>
                <small>{feature.text}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-catalog">
        <h2 className="home-catalog-title">Nos Formations</h2>

        {loading && <p className="home-status">Chargement…</p>}
        {error && <p className="home-status home-status-error">Erreur : {error}</p>}

        <div className="home-catalog-grid">
          {formations.map((f) => (
            <div
              key={f.id}
              role="button"
              tabIndex={0}
              className="formation-card"
              onClick={() => onSelectFormation(f.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectFormation(f.id)
                }
              }}
            >
              <div className="formation-card-cover">
                {f.image ? (
                  <img src={f.image} alt={f.title} />
                ) : (
                  <span className="formation-card-placeholder">EduForm</span>
                )}
              </div>
              <div className="formation-card-body">
                <span className="formation-card-category">{f.category ?? 'Général'}</span>
                <h3>{f.title}</h3>
                <p>{f.description ?? ''}</p>
                <StarRating
                  value={f.averageRating}
                  count={f.ratingCount}
                  onChange={(rating) => handleRateFormation(f.id, rating)}
                  disabled={pendingId === f.id}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
