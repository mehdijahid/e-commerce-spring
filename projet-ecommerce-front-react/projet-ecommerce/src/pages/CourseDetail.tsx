import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { CourseDetail as CourseDetailData } from '../services/api'
import { fetchCourseDetail, rateCourse, completeCourse, AuthError } from '../services/api'
import './CourseDetail.css'

interface CourseDetailProps {
  courseId: number
  onBack: () => void
  onAuthError: () => void
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`course-detail-star-icon${filled ? ' is-filled' : ''}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
    >
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.2l7.1-.6L12 2z" />
    </svg>
  )
}

function renderContent(details: string | null, images: CourseDetailData['images']): ReactNode[] {
  const paragraphs = (details ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const byPosition = new Map(images.map((img) => [img.position, img.image]))

  const blocks: ReactNode[] = []
  paragraphs.forEach((paragraph, index) => {
    blocks.push(<p key={`p-${index}`}>{paragraph}</p>)
    const image = byPosition.get(index)
    if (image) {
      blocks.push(<img key={`img-${index}`} className="course-detail-embed" src={image} alt="" />)
    }
  })
  return blocks
}

export default function CourseDetail({ courseId, onBack, onAuthError }: CourseDetailProps) {
  const [course, setCourse] = useState<CourseDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hovered, setHovered] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setError(null)
    return fetchCourseDetail(courseId)
      .then(setCourse)
      .catch((err) => {
        if (err instanceof AuthError) {
          onAuthError()
          return
        }
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      })
  }, [courseId, onAuthError])

  useEffect(() => {
    setLoading(true)
    refresh().finally(() => setLoading(false))
  }, [refresh])

  async function handleRate(rating: number) {
    if (submitting) return
    setSubmitting(true)
    setNotice(null)
    try {
      await rateCourse(courseId, rating)
      setNotice('Note enregistrée.')
      await refresh()
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthError()
        return
      }
      setNotice(err instanceof Error ? err.message : 'Erreur lors de la notation')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleComplete() {
    if (submitting || course?.completed) return
    const confirmed = window.confirm('Marquer ce cours comme complété ?')
    if (!confirmed) return
    setSubmitting(true)
    setNotice(null)
    try {
      await completeCourse(courseId)
      setNotice('Cours marqué comme complété.')
      await refresh()
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthError()
        return
      }
      setNotice(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    } finally {
      setSubmitting(false)
    }
  }

  const activeRating = course?.userRating ?? 0

  return (
    <div className="course-detail">
      <button type="button" className="course-detail-back" onClick={onBack}>
        ← Retour aux cours
      </button>

      {loading && <p className="course-detail-status">Chargement…</p>}
      {error && <p className="course-detail-status course-detail-status-error">Erreur : {error}</p>}

      {course && (
        <>
          <header className="course-detail-header">
            {course.image && (
              <div className="course-detail-thumb">
                <img src={course.image} alt={course.title} />
              </div>
            )}
            <div className="course-detail-heading">
              <h1>{course.title}</h1>
              <p>{course.content ?? ''}</p>
            </div>
          </header>

          <section className="course-detail-rating">
            <div
              className="course-detail-stars"
              role="radiogroup"
              aria-label="Noter ce cours"
              onMouseLeave={() => setHovered(0)}
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const filled = value <= (hovered || activeRating)
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={activeRating === value}
                    aria-label={`${value} étoile${value > 1 ? 's' : ''}`}
                    className="course-detail-star"
                    onMouseEnter={() => setHovered(value)}
                    onClick={() => handleRate(value)}
                    disabled={submitting}
                  >
                    <StarIcon filled={filled} />
                  </button>
                )
              })}
            </div>
            <div className="course-detail-rating-meta">
              <span className="course-detail-average">
                {course.averageRating.toFixed(1).replace('.', ',')}/5
              </span>
              <span className="course-detail-count">
                {course.ratingCount} avis
              </span>
            </div>
          </section>

          <article className="course-detail-content">
            {renderContent(course.details, course.images)}
          </article>

          <section className="course-detail-reviews">
            <h2>Avis des étudiants</h2>
            {course.reviews.length === 0 ? (
              <p className="course-detail-reviews-empty">
                Aucun avis pour le moment. Soyez le premier à noter ce cours.
              </p>
            ) : (
              <ul className="course-detail-reviews-list">
                {course.reviews.map((review) => (
                  <li className="course-detail-review" key={review.id}>
                    <div className="course-detail-review-head">
                      <span className="course-detail-review-name">{review.userName}</span>
                      <span className="course-detail-review-stars">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <svg
                            key={value}
                            viewBox="0 0 24 24"
                            className="course-detail-review-star"
                            fill={value <= review.rating ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth={1.6}
                            strokeLinejoin="round"
                          >
                            <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.2l7.1-.6L12 2z" />
                          </svg>
                        ))}
                      </span>
                    </div>
                    {review.comment && <p className="course-detail-review-comment">{review.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {notice && <p className="course-detail-notice">{notice}</p>}

          <div className="course-detail-actions">
            <button
              type="button"
              className={`course-detail-complete${course.completed ? ' is-completed' : ''}`}
              onClick={handleComplete}
              disabled={submitting || course.completed}
            >
              {course.completed ? '✓ Cours complété' : 'Marquer comme complété'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
