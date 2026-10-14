import { useEffect, useState } from 'react'
import type { MyFormation } from '../services/api'
import { fetchMyFormations, AuthError } from '../services/api'
import './MyFormations.css'

interface MyFormationsProps {
  onBack: () => void
  onSelectFormation: (id: number) => void
  onAuthError: () => void
}

export default function MyFormations({ onBack, onSelectFormation, onAuthError }: MyFormationsProps) {
  const [formations, setFormations] = useState<MyFormation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMyFormations()
      .then(setFormations)
      .catch((err) => {
        if (err instanceof AuthError) {
          onAuthError()
          return
        }
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      })
      .finally(() => setLoading(false))
  }, [onAuthError])

  return (
    <div className="my-formations">
      <button type="button" className="my-formations-back" onClick={onBack}>
        ← Retour à l'accueil
      </button>

      <h1 className="my-formations-title">Mes formations</h1>

      {loading && <p className="my-formations-status">Chargement…</p>}
      {error && <p className="my-formations-status my-formations-status-error">Erreur : {error}</p>}

      {!loading && !error && formations.length === 0 && (
        <p className="my-formations-empty">
          Vous n'avez encore complété aucun cours. Complétez au moins un cours d'une formation pour qu'elle
          apparaisse ici.
        </p>
      )}

      <div className="home-catalog-grid">
        {formations.map((f) => (
          <button
            type="button"
            key={f.id}
            className="formation-card"
            onClick={() => onSelectFormation(f.id)}
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
              <p className="my-formations-progress">
                {f.completedCount}/{f.totalCount} cours complétés
              </p>
              <p>{f.description ?? ''}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
