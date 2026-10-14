import { useCallback, useEffect, useRef, useState } from 'react'
import type { Course, CourseInput, FormationDetail, FormationInput } from '../services/api'
import {
  fetchFormations,
  fetchFormationDetail,
  fetchCourseDetail,
  createFormation,
  updateFormation,
  deleteFormation,
  createCourse,
  updateCourse,
  deleteCourse,
  AuthError,
} from '../services/api'
import Sidebar from './Sidebar'
import type { AdminView } from './Sidebar'
import Dashboard from './Dashboard'
import UsersView from './UsersView'
import AvisView from './AvisView'
import UploadField from './UploadField'
import './Admin.css'

interface AdminProps {
  userName: string
  onLogout: () => void
  onGoAccount: () => void
  onAuthError: () => void
}

interface FormationFormState {
  id?: number
  title: string
  description: string
  category: string
  image: string
}

interface CourseFormState {
  formationId: number
  id?: number
  title: string
  content: string
  details: string
  image: string
  images: string[]
}

export default function Admin({ userName, onLogout, onGoAccount, onAuthError }: AdminProps) {
  const [activeView, setActiveView] = useState<AdminView>('dashboard')
  const [formations, setFormations] = useState<FormationDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formFormation, setFormFormation] = useState<FormationFormState | null>(null)
  const [formCourse, setFormCourse] = useState<CourseFormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
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

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    return fetchFormations()
      .then((list) => Promise.all(list.map((f) => fetchFormationDetail(f.id))))
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

  useEffect(() => {
    if (activeView === 'formations' || activeView === 'courses') {
      load()
    }
  }, [load, activeView])

  function openNewFormation() {
    setFormFormation({ title: '', description: '', category: '', image: '' })
  }

  function openEditFormation(f: FormationDetail) {
    setFormFormation({
      id: f.id,
      title: f.title,
      description: f.description ?? '',
      category: f.category ?? '',
      image: f.image ?? '',
    })
  }

  async function saveFormation(e: React.FormEvent) {
    e.preventDefault()
    if (!formFormation) return
    setSaving(true)
    setNotice(null)
    const data: FormationInput = {
      title: formFormation.title,
      description: formFormation.description || null,
      category: formFormation.category || null,
      image: formFormation.image || null,
    }
    try {
      if (formFormation.id) {
        await updateFormation(formFormation.id, data)
      } else {
        await createFormation(data)
      }
      setFormFormation(null)
      setNotice('Formation enregistrée.')
      await load()
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthError()
        return
      }
      setNotice(err instanceof Error ? err.message : 'Erreur lors de l\u2019enregistrement')
    } finally {
      setSaving(false)
    }
  }

  async function removeFormation(f: FormationDetail) {
    if (!window.confirm(`Supprimer la formation \u00ab ${f.title} \u00bb et tous ses cours ?`)) return
    setSaving(true)
    setNotice(null)
    try {
      await deleteFormation(f.id)
      setNotice('Formation supprimée.')
      await load()
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthError()
        return
      }
      setNotice(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setSaving(false)
    }
  }

  function openNewCourse(formationId: number) {
    setFormCourse({ formationId, title: '', content: '', details: '', image: '', images: [] })
  }

  function openEditCourse(course: Course, formationId: number) {
    fetchCourseDetail(course.id)
      .then((detail) =>
        setFormCourse({
          formationId,
          id: detail.id,
          title: detail.title,
          content: detail.content ?? '',
          details: detail.details ?? '',
          image: detail.image ?? '',
          images: detail.images.map((img) => img.image),
        }),
      )
      .catch((err) => {
        if (err instanceof AuthError) {
          onAuthError()
        }
      })
  }

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault()
    if (!formCourse) return
    setSaving(true)
    setNotice(null)
    const data: CourseInput = {
      title: formCourse.title,
      content: formCourse.content,
      details: formCourse.details,
      image: formCourse.image,
      images: formCourse.images.filter((url) => url.trim() !== ''),
    }
    try {
      if (formCourse.id) {
        await updateCourse(formCourse.id, data)
      } else {
        await createCourse(formCourse.formationId, data)
      }
      setFormCourse(null)
      setNotice('Cours enregistré.')
      await load()
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthError()
        return
      }
      setNotice(err instanceof Error ? err.message : 'Erreur lors de l\u2019enregistrement')
    } finally {
      setSaving(false)
    }
  }

  async function removeCourse(course: Course) {
    if (!window.confirm(`Supprimer le cours \u00ab ${course.title} \u00bb ?`)) return
    setSaving(true)
    setNotice(null)
    try {
      await deleteCourse(course.id)
      setNotice('Cours supprimé.')
      await load()
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthError()
        return
      }
      setNotice(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin">
      <Sidebar logo="/siteweb-logo.png" activeView={activeView} onNavigate={setActiveView} onLogout={onLogout} />

      <main className="admin-content">
        <div className="admin-topbar">
          <span className="admin-topbar-label">Administration</span>
          <div className="admin-topbar-user" ref={menuRef}>
            <button
              type="button"
              className="admin-topbar-user-btn"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="admin-topbar-user-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <circle cx="12" cy="8" r="3.5" stroke="#fff" strokeWidth="1.6" />
                  <path d="M4.5 20c0-3.3 3.1-5 7.5-5s7.5 1.7 7.5 5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <span className="admin-topbar-user-name">{userName}</span>
            </button>
            {menuOpen && (
              <div className="admin-topbar-menu" role="menu">
                <button type="button" className="admin-topbar-menu-item" role="menuitem" onClick={() => { setMenuOpen(false); onGoAccount() }}>
                  Gérer mon compte
                </button>
                <button type="button" className="admin-topbar-menu-item admin-topbar-menu-item-danger" role="menuitem" onClick={onLogout}>
                  Déconnecter
                </button>
              </div>
            )}
          </div>
        </div>

        {activeView === 'dashboard' && <Dashboard onAuthError={onAuthError} />}

        {activeView === 'users' && <UsersView onAuthError={onAuthError} />}

        {activeView === 'avis' && <AvisView onAuthError={onAuthError} />}

        {activeView === 'formations' && (<>
        {loading && <p className="admin-status">Chargement…</p>}
        {error && <p className="admin-status admin-status-error">Erreur : {error}</p>}

        {!loading && !formFormation && (
          <button type="button" className="admin-add" onClick={openNewFormation}>
            + Ajouter une formation
          </button>
        )}

        {formFormation && (
          <form className="admin-form" onSubmit={saveFormation}>
            <h2>{formFormation.id ? 'Modifier la formation' : 'Nouvelle formation'}</h2>
            <label className="admin-field">
              <span className="admin-field-label">Titre</span>
              <input
                type="text"
                required
                value={formFormation.title}
                onChange={(e) => setFormFormation({ ...formFormation, title: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Description</span>
              <textarea
                rows={2}
                value={formFormation.description}
                onChange={(e) => setFormFormation({ ...formFormation, description: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Catégorie</span>
              <input
                type="text"
                value={formFormation.category}
                onChange={(e) => setFormFormation({ ...formFormation, category: e.target.value })}
              />
            </label>
            <UploadField
              label="Image de la formation"
              value={formFormation.image}
              onChange={(url) => setFormFormation({ ...formFormation, image: url })}
              onAuthError={onAuthError}
            />
            <div className="admin-form-actions">
              <button type="submit" className="admin-submit" disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button type="button" className="admin-cancel" onClick={() => setFormFormation(null)}>
                Annuler
              </button>
            </div>
          </form>
        )}

        <div className="admin-list">
          {formations.map((formation) => (
            <article className="admin-formation" key={formation.id}>
              <div className="admin-formation-head">
                {formation.image && (
                  <img className="admin-formation-thumb" src={formation.image} alt="" />
                )}
                <div className="admin-formation-info">
                  <span className="admin-chip">{formation.category ?? 'Général'}</span>
                  <h2>{formation.title}</h2>
                  <p>{formation.description ?? ''}</p>
                </div>
                <div className="admin-formation-actions">
                  <button type="button" onClick={() => openEditFormation(formation)}>
                    Modifier
                  </button>
                  <button type="button" className="admin-danger" onClick={() => removeFormation(formation)}>
                    Supprimer
                  </button>
                </div>
              </div>

              <div className="admin-courses">
                {formation.courses.map((course) => (
                  <div className="admin-course" key={course.id}>
                    <span className="admin-course-title">{course.title}</span>
                    <div className="admin-course-actions">
                      <button type="button" onClick={() => openEditCourse(course, formation.id)}>
                        Modifier
                      </button>
                      <button type="button" className="admin-danger" onClick={() => removeCourse(course)}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
                {!formCourse && (
                  <button type="button" className="admin-add-small" onClick={() => openNewCourse(formation.id)}>
                    + Ajouter un cours
                  </button>
                )}
              </div>

              {formCourse && formCourse.formationId === formation.id && (
                <form className="admin-form" onSubmit={saveCourse}>
                  <h2>{formCourse.id ? 'Modifier le cours' : 'Nouveau cours'}</h2>
                  <label className="admin-field">
                    <span className="admin-field-label">Titre</span>
                    <input
                      type="text"
                      required
                      value={formCourse.title}
                      onChange={(e) => setFormCourse({ ...formCourse, title: e.target.value })}
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Description courte (à côté du titre)</span>
                    <textarea
                      rows={2}
                      value={formCourse.content}
                      onChange={(e) => setFormCourse({ ...formCourse, content: e.target.value })}
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Contenu détaillé (paragraphes séparés par une ligne vide)</span>
                    <textarea
                      rows={8}
                      value={formCourse.details}
                      onChange={(e) => setFormCourse({ ...formCourse, details: e.target.value })}
                    />
                  </label>
                  <UploadField
                    label="Photo du cours (en haut à gauche)"
                    value={formCourse.image}
                    onChange={(url) => setFormCourse({ ...formCourse, image: url })}
                    onAuthError={onAuthError}
                  />
                  <div className="admin-field">
                    <span className="admin-field-label">Images entre les paragraphes</span>
                    <p className="admin-hint">
                      L'image n°1 s'affiche après le 1er paragraphe, la n°2 après le 2e, etc.
                    </p>
                    {formCourse.images.map((url, index) => (
                      <div className="admin-embed-row" key={index}>
                        <UploadField
                          label={`Image après le paragraphe ${index + 1}`}
                          value={url}
                          onChange={(next) => {
                            const images = [...formCourse.images]
                            images[index] = next
                            setFormCourse({ ...formCourse, images })
                          }}
                          onAuthError={onAuthError}
                        />
                        <button
                          type="button"
                          className="admin-remove-row"
                          onClick={() =>
                            setFormCourse({
                              ...formCourse,
                              images: formCourse.images.filter((_, i) => i !== index),
                            })
                          }
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="admin-add-small"
                      onClick={() => setFormCourse({ ...formCourse, images: [...formCourse.images, ''] })}
                    >
                      + Ajouter une image entre les paragraphes
                    </button>
                  </div>
                  <div className="admin-form-actions">
                    <button type="submit" className="admin-submit" disabled={saving}>
                      {saving ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                    <button type="button" className="admin-cancel" onClick={() => setFormCourse(null)}>
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </article>
          ))}
        </div>

        {notice && <p className="admin-notice">{notice}</p>}
        </>)}

        {activeView === 'courses' && (<>
        {loading && <p className="admin-status">Chargement…</p>}
        {error && <p className="admin-status admin-status-error">Erreur : {error}</p>}

        {!loading && !formCourse && (
          <button type="button" className="admin-add" onClick={() => {
            const firstId = formations.length > 0 ? formations[0].id : 0
            setFormCourse({ formationId: firstId, title: '', content: '', details: '', image: '', images: [] })
          }}>
            + Ajouter un cours
          </button>
        )}

        {formCourse && (
          <form className="admin-form" onSubmit={saveCourse}>
            <h2>{formCourse.id ? 'Modifier le cours' : 'Nouveau cours'}</h2>
            {!formCourse.id && (
              <label className="admin-field">
                <span className="admin-field-label">Formation parente</span>
                <select
                  required
                  value={formCourse.formationId}
                  onChange={(e) => setFormCourse({ ...formCourse, formationId: Number(e.target.value) })}
                >
                  <option value="">-- Choisir une formation --</option>
                  {formations.map((f) => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="admin-field">
              <span className="admin-field-label">Titre</span>
              <input
                type="text"
                required
                value={formCourse.title}
                onChange={(e) => setFormCourse({ ...formCourse, title: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Description courte (à côté du titre)</span>
              <textarea
                rows={2}
                value={formCourse.content}
                onChange={(e) => setFormCourse({ ...formCourse, content: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Contenu détaillé (paragraphes séparés par une ligne vide)</span>
              <textarea
                rows={8}
                value={formCourse.details}
                onChange={(e) => setFormCourse({ ...formCourse, details: e.target.value })}
              />
            </label>
            <UploadField
              label="Photo du cours (en haut à gauche)"
              value={formCourse.image}
              onChange={(url) => setFormCourse({ ...formCourse, image: url })}
              onAuthError={onAuthError}
            />
            <div className="admin-field">
              <span className="admin-field-label">Images entre les paragraphes</span>
              <p className="admin-hint">
                L'image n°1 s'affiche après le 1er paragraphe, la n°2 après le 2e, etc.
              </p>
              {formCourse.images.map((url, index) => (
                <div className="admin-embed-row" key={index}>
                  <UploadField
                    label={`Image après le paragraphe ${index + 1}`}
                    value={url}
                    onChange={(next) => {
                      const images = [...formCourse.images]
                      images[index] = next
                      setFormCourse({ ...formCourse, images })
                    }}
                    onAuthError={onAuthError}
                  />
                  <button
                    type="button"
                    className="admin-remove-row"
                    onClick={() =>
                      setFormCourse({
                        ...formCourse,
                        images: formCourse.images.filter((_, i) => i !== index),
                      })
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="admin-add-small"
                onClick={() => setFormCourse({ ...formCourse, images: [...formCourse.images, ''] })}
              >
                + Ajouter une image entre les paragraphes
              </button>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-submit" disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button type="button" className="admin-cancel" onClick={() => setFormCourse(null)}>
                Annuler
              </button>
            </div>
          </form>
        )}

        <div className="admin-list">
          {formations.map((formation) => (
            <article className="admin-formation" key={formation.id}>
              <div className="admin-formation-head">
                {formation.image && (
                  <img className="admin-formation-thumb" src={formation.image} alt="" />
                )}
                <div className="admin-formation-info">
                  <span className="admin-chip">{formation.category ?? 'Général'}</span>
                  <h2>{formation.title}</h2>
                </div>
              </div>

              <div className="admin-courses">
                {formation.courses.map((course) => (
                  <div className="admin-course" key={course.id}>
                    <span className="admin-course-title">{course.title}</span>
                    <div className="admin-course-actions">
                      <button type="button" onClick={() => openEditCourse(course, formation.id)}>
                        Modifier
                      </button>
                      <button type="button" className="admin-danger" onClick={() => removeCourse(course)}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
                {!formCourse && (
                  <button type="button" className="admin-add-small" onClick={() => openNewCourse(formation.id)}>
                    + Ajouter un cours
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {notice && <p className="admin-notice">{notice}</p>}
        </>)}

      </main>
    </div>
  )
}
