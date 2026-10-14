import { useState } from 'react'
import type { FormEvent } from 'react'
import { login } from '../services/auth'
import AuthLayout from './AuthLayout'

interface LoginProps {
  onSuccess: (token: string) => void
  onSwitchToRegister: () => void
}

export default function Login({ onSuccess, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const token = await login(email, password)
      onSuccess(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="auth-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
          <path
            d="M3 9l9-6 9 6-9 6-9-6z"
            fill="#fff"
            fillOpacity="0.25"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M3 14l9 6 9-6"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1>Bon retour !</h1>
      <p className="auth-subtitle">Connectez-vous à votre compte pour continuer</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="email">Adresse e-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="auth-switch">
        Pas encore de compte ?{' '}
        <button type="button" onClick={onSwitchToRegister}>
          Créer un compte
        </button>
      </p>
    </AuthLayout>
  )
}
