import { useCallback, useEffect, useState } from 'react'
import type { FormationDetail } from '../services/api'
import { fetchFormationDetail, rateCourse, enrollInFormation, checkEnrollmentStatus, AuthError } from '../services/api'
import StarRating from '../components/StarRating'
import './CourseList.css'

interface CourseListProps {
  formationId: number
  onBack: () => void
  onSelectCourse: (courseId: number) => void
  onAuthError: () => void
}

export default function CourseList({ formationId, onBack, onSelectCourse, onAuthError }: CourseListProps) {
  const [formation, setFormation] = useState<FormationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingCourseId, setPendingCourseId] = useState<number | null>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetchFormationDetail(formationId)
      .then(setFormation)
      .catch((err) => {
        if (err instanceof AuthError) {
          onAuthError()
          return
        }
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      })
      .finally(() => setLoading(false))
  }, [formationId, onAuthError])

  useEffect(() => {
    load()
    checkEnrollmentStatus(formationId)
      .then(setEnrolled)
      .catch(() => {})
  }, [formationId, load])

  async function handleRateCourse(courseId: number, rating: number) {
    setPendingCourseId(courseId)
    try {
      await rateCourse(courseId, rating)
      load()
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthError()
      }
    } finally {
      setPendingCourseId(null)
    }
  }

  async function handleEnroll() {
    setEnrolling(true)
    try {
      await enrollInFormation(formationId)
      setEnrolled(true)
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthError()
      } else {
        setError(err instanceof Error ? err.message : "Erreur lors de l'inscription")
      }
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <div className="course-list">
      <button type="button" className="course-list-back" onClick={onBack}>
        &larr; Retour aux formations
      </button>

      {loading && <p className="course-list-status">Chargement&#8230;</p>}
      {error && <p className="course-list-status course-list-status-error">Erreur : {error}</p>}

      {formation && (
        <>
          <header className="course-list-header">
            {formation.image && <img src={formation.image} alt={formation.title} />}
            <div>
              <span className="course-list-category">{formation.category ?? 'Général'}</span>
              <h1>{formation.title}</h1>
              <p>{formation.description ?? ''}</p>
              <div className="course-list-actions">
                {!enrolled ? (
                  <button
                    type="button"
                    className="course-list-enroll-btn"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Inscription...' : "S'inscrire à cette formation"}
                  </button>
                ) : (
                  <span className="course-list-enrolled-badge">Inscrit</span>
                )}
              </div>
            </div>
          </header>

          <h2 className="course-list-subtitle">
            {formation.courses.length} cours
          </h2>

          <div className="course-list-progress">
            <div className="course-list-progress-head">
              <span>Progression</span>
              <strong>
                {formation.completedCount}/{formation.totalCount} cours complétés
              </strong>
            </div>
            <div className="course-list-progress-track">
              <div
                className="course-list-progress-fill"
                style={{
                  width: `${
                    formation.totalCount > 0
                      ? Math.round((formation.completedCount / formation.totalCount) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="course-list-grid">
            {formation.courses.map((course, index) => (
              <div
                key={course.id}
                role="button"
                tabIndex={0}
                className="course-card"
                onClick={() => onSelectCourse(course.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectCourse(course.id)
                  }
                }}
              >
                <div className="course-card-cover">
                  {course.image ? (
                    <img src={course.image} alt={course.title} />
                  ) : (
                    <span className="course-card-placeholder">
                      {index + 1}
                    </span>
                  )}
                  {course.completed && (
                    <span className="course-card-badge">&#10003; Complété</span>
                  )}
                </div>
                <div className="course-card-body">
                  <span className="course-card-number">Cours {index + 1}</span>
                  <h3>{course.title}</h3>
                  <p>{course.content ?? ''}</p>
                  <StarRating
                    value={course.averageRating}
                    count={course.ratingCount}
                    onChange={(rating) => handleRateCourse(course.id, rating)}
                    disabled={pendingCourseId === course.id}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
