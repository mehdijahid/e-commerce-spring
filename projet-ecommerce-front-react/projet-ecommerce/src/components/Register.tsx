import { useState } from 'react'
import type { FormEvent } from 'react'
import { login, register } from '../services/auth'
import AuthLayout from './AuthLayout'

interface RegisterProps {
  onSuccess: (token: string) => void
  onSwitchToLogin: () => void
}

export default function Register({ onSuccess, onSwitchToLogin }: RegisterProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await register(name, email, password)
      const token = await login(email, password)
      onSuccess(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="auth-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
          <path
            d="M12 12a4 4 0 100-8 4 4 0 000 8z"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 21c0-4 4-6 8-6s8 2 8 6"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1>Créer un compte</h1>
      <p className="auth-subtitle">Rejoignez-nous en quelques secondes</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="name">Nom complet</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jean Dupont"
            required
            autoComplete="name"
          />
        </div>

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
            placeholder="8 caractères minimum"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? 'Inscription…' : "S'inscrire"}
        </button>
      </form>

      <p className="auth-switch">
        Déjà un compte ?{' '}
        <button type="button" onClick={onSwitchToLogin}>
          Se connecter
        </button>
      </p>
    </AuthLayout>
  )
}
