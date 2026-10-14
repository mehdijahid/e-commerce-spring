import { useState } from 'react'
import type { FormEvent } from 'react'
import type { AccountUpdateResult } from '../services/api'
import { updateAccount, AuthError } from '../services/api'
import '../components/Auth.css'
import './Account.css'

interface AccountProps {
  userName: string
  email: string
  onBack: () => void
  onAuthError: () => void
  onUpdated: (result: AccountUpdateResult) => void
}

export default function Account({ userName, email, onBack, onAuthError, onUpdated }: AccountProps) {
  const [name, setName] = useState(userName)
  const [userEmail, setUserEmail] = useState(email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setLoading(true)

    try {
      const result = await updateAccount({
        name,
        email: userEmail,
        currentPassword,
        newPassword: newPassword || null,
      })
      setCurrentPassword('')
      setNewPassword('')
      setNotice('Compte mis à jour.')
      onUpdated(result)
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthError()
        return
      }
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="account">
      <button type="button" className="account-back" onClick={onBack}>
        ← Retour à l'accueil
      </button>

      <div className="account-card">
        <h1>Gérer mon compte</h1>
        <p className="account-subtitle">Mettez à jour vos informations personnelles</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="account-name">Nom complet</label>
            <input
              id="account-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-field">
            <label htmlFor="account-email">Adresse e-mail</label>
            <input
              id="account-email"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="account-current-password">Mot de passe actuel</label>
            <input
              id="account-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Requis pour confirmer les modifications"
            />
          </div>

          <div className="form-field">
            <label htmlFor="account-new-password">Nouveau mot de passe (facultatif)</label>
            <input
              id="account-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              autoComplete="new-password"
              placeholder="6 caractères minimum"
            />
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="account-notice" role="status">
              {notice}
            </p>
          )}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>
    </div>
  )
}
