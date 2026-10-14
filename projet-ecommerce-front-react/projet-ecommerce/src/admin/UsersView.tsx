import { useCallback, useEffect, useState } from 'react'
import type { AdminUser } from '../services/api'
import { fetchAdminUsers, updateAdminUser, deleteAdminUser, AuthError } from '../services/api'
import './UsersView.css'

interface UsersViewProps {
  onAuthError: () => void
}

export default function UsersView({ onAuthError }: UsersViewProps) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchAdminUsers()
      .then(setUsers)
      .catch((err) => {
        if (err instanceof AuthError) { onAuthError(); return }
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      })
      .finally(() => setLoading(false))
  }, [onAuthError])

  useEffect(() => { load() }, [load])

  async function handleRoleChange(user: AdminUser, newRole: string) {
    setUpdatingId(user.id)
    setNotice(null)
    try {
      const updated = await updateAdminUser(user.id, { role: newRole })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      setNotice('Rôle mis à jour.')
    } catch (err) {
      if (err instanceof AuthError) { onAuthError(); return }
      setNotice(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleToggleActive(user: AdminUser) {
    setUpdatingId(user.id)
    setNotice(null)
    try {
      const updated = await updateAdminUser(user.id, { active: !user.active })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      setNotice(updated.active ? 'Utilisateur activé.' : 'Utilisateur désactivé.')
    } catch (err) {
      if (err instanceof AuthError) { onAuthError(); return }
      setNotice(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleDelete(user: AdminUser) {
    if (!window.confirm(`Supprimer l'utilisateur "${user.name}" ? Cette action est irréversible.`)) return
    setUpdatingId(user.id)
    setNotice(null)
    try {
      await deleteAdminUser(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      setNotice('Utilisateur supprimé.')
    } catch (err) {
      if (err instanceof AuthError) { onAuthError(); return }
      setNotice(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const adminCount = users.filter((u) => u.role === 'ADMIN').length
  const activeCount = users.filter((u) => u.active).length

  return (
    <div className="users-view">
      <div className="users-header">
        <h1 className="users-title">Gestion des utilisateurs</h1>
        <div className="users-stats-row">
          <span className="users-stat-chip">{users.length} utilisateur{users.length > 1 ? 's' : ''}</span>
          <span className="users-stat-chip users-stat-chip-admin">{adminCount} admin{adminCount > 1 ? 's' : ''}</span>
          <span className="users-stat-chip users-stat-chip-active">{activeCount} actif{activeCount > 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="users-search-wrap">
        <svg className="users-search-icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          className="users-search"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <p className="users-status">Chargement...</p>}
      {error && <p className="users-status users-status-error">Erreur : {error}</p>}

      {!loading && (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>État</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="users-empty">Aucun utilisateur trouvé</td>
                </tr>
              )}
              {filtered.map((user) => (
                <tr key={user.id} className={!user.active ? 'users-row-inactive' : ''}>
                  <td>
                    <div className="users-name-cell">
                      <div className="users-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="users-name">{user.name}</span>
                    </div>
                  </td>
                  <td className="users-email">{user.email}</td>
                  <td>
                    <select
                      className={`users-role-select ${user.role === 'ADMIN' ? 'users-role-admin' : 'users-role-user'}`}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      disabled={updatingId === user.id}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>
                    <span className={`users-badge ${user.active ? 'users-badge-active' : 'users-badge-inactive'}`}>
                      {user.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    <div className="users-action-btns">
                      <button
                        type="button"
                        className={`users-toggle-btn ${user.active ? 'users-toggle-deactivate' : 'users-toggle-activate'}`}
                        onClick={() => handleToggleActive(user)}
                        disabled={updatingId === user.id}
                      >
                        {updatingId === user.id ? '...' : (user.active ? 'Désactiver' : 'Activer')}
                      </button>
                      <button
                        type="button"
                        className="users-toggle-btn users-delete-btn"
                        onClick={() => handleDelete(user)}
                        disabled={updatingId === user.id}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {notice && <p className="users-notice">{notice}</p>}
    </div>
  )
}
