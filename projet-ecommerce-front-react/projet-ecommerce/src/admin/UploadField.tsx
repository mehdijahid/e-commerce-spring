import { useState } from 'react'
import { uploadImage, AuthError } from '../services/api'

interface UploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  onAuthError: () => void
}

export default function UploadField({ label, value, onChange, onAuthError }: UploadFieldProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthError()
        return
      }
      setError(err instanceof Error ? err.message : 'Erreur lors de l\u2019upload')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-upload">
      <span className="admin-field-label">{label}</span>
      {value ? (
        <div className="admin-upload-preview">
          <img src={value} alt="" />
          <div className="admin-upload-actions">
            <label className="admin-upload-btn">
              {busy ? 'Envoi\u2026' : 'Changer'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
            <button type="button" className="admin-upload-remove" onClick={() => onChange('')}>
              Retirer
            </button>
          </div>
        </div>
      ) : (
        <label className="admin-upload-btn">
          {busy ? 'Envoi\u2026' : 'Importer une image'}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      )}
      {error && <span className="admin-field-error">{error}</span>}
    </div>
  )
}
