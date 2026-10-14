import { useCallback, useEffect, useState } from 'react'
import type { AdminReview } from '../services/api'
import { fetchAdminReviews, AuthError } from '../services/api'
import './AvisView.css'

interface AvisViewProps {
  onAuthError: () => void
}

export default function AvisView({ onAuthError }: AvisViewProps) {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'Cours' | 'Formation'>('all')

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchAdminReviews()
      .then(setReviews)
      .catch((err) => {
        if (err instanceof AuthError) { onAuthError(); return }
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      })
      .finally(() => setLoading(false))
  }, [onAuthError])

  useEffect(() => { load() }, [load])

  const filtered = reviews.filter((r) => filter === 'all' || r.targetType === filter)
  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
    : '0.0'
  const fiveStars = reviews.filter((r) => r.rating === 5).length
  const lowStars = reviews.filter((r) => r.rating <= 2).length

  return (
    <div className="avis-view">
      <div className="avis-header">
        <h1 className="avis-title">Gestion des avis</h1>
        <div className="avis-stats-row">
          <span className="avis-stat-chip">{reviews.length} avis</span>
          <span className="avis-stat-chip avis-stat-avg">{avgRating} / 5 moyenne</span>
          <span className="avis-stat-chip avis-stat-five">{fiveStars} 5 étoiles</span>
          {lowStars > 0 && (
            <span className="avis-stat-chip avis-stat-low">{lowStars} critiques</span>
          )}
        </div>
      </div>

      <div className="avis-filters">
        {(['all', 'Cours', 'Formation'] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`avis-filter-btn ${filter === f ? 'avis-filter-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tous' : f}
          </button>
        ))}
      </div>

      {loading && <p className="avis-status">Chargement...</p>}
      {error && <p className="avis-status avis-status-error">Erreur : {error}</p>}

      {!loading && (
        <div className="avis-list">
          {filtered.length === 0 && (
            <p className="avis-empty">Aucun avis trouvé</p>
          )}
          {filtered.map((review) => (
            <div className="avis-card" key={review.id}>
              <div className="avis-card-header">
                <div className="avis-avatar">{review.userName.charAt(0).toUpperCase()}</div>
                <div className="avis-card-info">
                  <span className="avis-card-name">{review.userName}</span>
                  <span className={`avis-card-type ${review.targetType === 'Formation' ? 'avis-type-formation' : 'avis-type-cours'}`}>
                    {review.targetType}
                  </span>
                </div>
                <div className="avis-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={s <= review.rating ? 'avis-star-filled' : 'avis-star-empty'}>&#9733;</span>
                  ))}
                </div>
              </div>
              <div className="avis-card-body">
                <span className="avis-card-target">{review.targetTitle}</span>
                {review.comment && <p className="avis-card-comment">{review.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
