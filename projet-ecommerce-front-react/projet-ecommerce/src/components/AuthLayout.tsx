import type { ReactNode } from 'react'
import './Auth.css'

const IMAGE_SRC = encodeURI('/ChatGPT Image 15 août 2026, 13_23_40.png')

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-form-panel">{children}</div>
        <div className="auth-image-panel">
          <div className="auth-panel-top">
            <img className="auth-site-logo" src="/siteweb-logo.png" alt="Logo EduForm" />
          </div>
          <img
            className="auth-panel-image"
            src={IMAGE_SRC}
            alt="Illustration e-commerce"
          />
          <div className="auth-panel-text">
            <p className="auth-tagline">Apprenez, progressez, réussissez</p>
            <p className="auth-motivation">
              Des formations en ligne de qualité pour développer vos compétences et
              atteindre vos objectifs professionnels.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
