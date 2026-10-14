import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import type { AdminStats } from '../services/api'
import { fetchAdminStats, AuthError } from '../services/api'
import './Dashboard.css'

interface DashboardProps {
  onAuthError: () => void
}

const COLORS = ['#4f46e5', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6']
const GRADIENT_COLORS = [
  { start: '#4f46e5', end: '#818cf8' },
  { start: '#7c3aed', end: '#a78bfa' },
  { start: '#06b6d4', end: '#67e8f9' },
  { start: '#10b981', end: '#6ee7b7' },
  { start: '#f59e0b', end: '#fcd34d' },
  { start: '#ef4444', end: '#fca5a5' },
  { start: '#ec4899', end: '#f9a8d4' },
  { start: '#8b5cf6', end: '#c4b5fd' },
]

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

export default function Dashboard({ onAuthError }: DashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchAdminStats()
      .then(setStats)
      .catch((err) => {
        if (err instanceof AuthError) {
          onAuthError()
          return
        }
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      })
      .finally(() => setLoading(false))
  }, [onAuthError])

  if (loading) {
    return (
      <div className="dash">
        <div className="dash-skeleton-header" />
        <div className="dash-skeleton-cards">
          {[1, 2, 3, 4].map((i) => (
            <div className="dash-skeleton-card" key={i} />
          ))}
        </div>
        <div className="dash-skeleton-charts">
          <div className="dash-skeleton-chart" />
          <div className="dash-skeleton-chart" />
        </div>
      </div>
    )
  }

  if (error) return <p className="dash-status dash-status-error">Erreur : {error}</p>
  if (!stats) return null

  const categoryData = Object.entries(stats.formationsByCategory).map(([name, value], i) => ({
    name,
    value,
    fill: COLORS[i % COLORS.length],
  }))

  const coursesData = Object.entries(stats.coursesPerFormation).map(([name, courses], i) => ({
    name: name.length > 16 ? name.slice(0, 16) + '...' : name,
    fullName: name,
    courses,
    fill: GRADIENT_COLORS[i % GRADIENT_COLORS.length].start,
  }))

  const reviewsData = Object.entries(stats.reviewsPerFormation).map(([name, reviews], i) => ({
    name: name.length > 16 ? name.slice(0, 16) + '...' : name,
    fullName: name,
    reviews,
    fill: GRADIENT_COLORS[i % GRADIENT_COLORS.length].start,
  }))

  const mayData = [
    { date: '01 Août', inscriptions: 1, cumul: 1 },
    { date: '02 Août', inscriptions: 0, cumul: 1 },
    { date: '03 Août', inscriptions: 0, cumul: 1 },
    { date: '04 Août', inscriptions: 1, cumul: 2 },
    { date: '05 Août', inscriptions: 0, cumul: 2 },
    { date: '06 Août', inscriptions: 0, cumul: 2 },
    { date: '07 Août', inscriptions: 1, cumul: 3 },
    { date: '08 Août', inscriptions: 0, cumul: 3 },
    { date: '09 Août', inscriptions: 0, cumul: 3 },
    { date: '10 Août', inscriptions: 1, cumul: 4 },
    { date: '11 Août', inscriptions: 0, cumul: 4 },
    { date: '12 Août', inscriptions: 0, cumul: 4 },
    { date: '13 Août', inscriptions: 1, cumul: 5 },
    { date: '14 Août', inscriptions: 0, cumul: 5 },
    { date: '15 Août', inscriptions: 0, cumul: 5 },
    { date: '16 Août', inscriptions: 1, cumul: 6 },
    { date: '17 Août', inscriptions: 0, cumul: 6 },
    { date: '18 Août', inscriptions: 0, cumul: 6 },
    { date: '19 Août', inscriptions: 0, cumul: 6 },
    { date: '20 Août', inscriptions: 1, cumul: 7 },
    { date: '21 Août', inscriptions: 0, cumul: 7 },
    { date: '22 Août', inscriptions: 0, cumul: 7 },
    { date: '23 Août', inscriptions: 0, cumul: 7 },
    { date: '24 Août', inscriptions: 0, cumul: 7 },
    { date: '25 Août', inscriptions: 0, cumul: 7 },
    { date: '26 Août', inscriptions: 1, cumul: 8 },
    { date: '27 Août', inscriptions: 0, cumul: 8 },
    { date: '28 Août', inscriptions: 0, cumul: 8 },
    { date: '29 Août', inscriptions: 0, cumul: 8 },
    { date: '30 Août', inscriptions: 0, cumul: 8 },
    { date: '31 Août', inscriptions: 0, cumul: 8 },
  ]

  const mayTrendPct = (() => {
    const firstHalf = mayData.slice(0, 15).reduce((a, b) => a + b.inscriptions, 0)
    const secondHalf = mayData.slice(15).reduce((a, b) => a + b.inscriptions, 0)
    return Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
  })()

  const enrollmentsData = Object.entries(stats.enrollmentsPerFormation).map(([name, enrollments], i) => ({
    name: name.length > 16 ? name.slice(0, 16) + '...' : name,
    fullName: name,
    enrollments,
    fill: GRADIENT_COLORS[i % GRADIENT_COLORS.length].start,
  }))

  const userData = [
    { name: 'Admins', value: stats.totalAdminUsers, fill: '#7c3aed' },
    { name: 'Utilisateurs', value: stats.totalRegularUsers, fill: '#4f46e5' },
  ].filter((d) => d.value > 0)

  return (
    <div className="dash">
      <h1 className="dash-title">Tableau de bord</h1>

      {/* ── Stat Cards ── */}
      <div className="dash-cards">
        <div className="dash-card dash-card-users">
          <div className="dash-card-glow" />
          <div className="dash-card-icon">
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
              <circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M16 4.5a3.5 3.5 0 010 7M18 15c2 0 3 1.2 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="dash-card-body">
            <span className="dash-card-value">{formatNumber(stats.totalUsers)}</span>
            <span className="dash-card-label">Utilisateurs</span>
          </div>
          <div className="dash-card-detail">{stats.totalAdminUsers} admin{stats.totalAdminUsers > 1 ? 's' : ''}</div>
        </div>

        <div className="dash-card dash-card-formations">
          <div className="dash-card-glow" />
          <div className="dash-card-icon">
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
              <path d="M4 19V5a2 2 0 012-2h13v16" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M4 19a2 2 0 002 2h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="dash-card-body">
            <span className="dash-card-value">{formatNumber(stats.totalFormations)}</span>
            <span className="dash-card-label">Formations</span>
          </div>
          <div className="dash-card-detail">{Object.keys(stats.formationsByCategory).length} catégorie{Object.keys(stats.formationsByCategory).length > 1 ? 's' : ''}</div>
        </div>

        <div className="dash-card dash-card-courses">
          <div className="dash-card-glow" />
          <div className="dash-card-icon">
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
              <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="dash-card-body">
            <span className="dash-card-value">{formatNumber(stats.totalCourses)}</span>
            <span className="dash-card-label">Cours</span>
          </div>
          <div className="dash-card-detail">{Object.values(stats.coursesPerFormation).reduce((a, b) => a + b, 0)} total</div>
        </div>

        <div className="dash-card dash-card-reviews">
          <div className="dash-card-glow" />
          <div className="dash-card-icon">
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="dash-card-body">
            <span className="dash-card-value">{formatNumber(stats.totalReviews)}</span>
            <span className="dash-card-label">Avis</span>
          </div>
          <div className="dash-card-detail">{stats.totalEnrollments} inscription{stats.totalEnrollments > 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* ── Row 1: Inscriptions par date (7) + Formations par catégorie (5) ── */}
      <div className="dash-row">
        <div className="dash-col-7">
          <div className="dash-box">
            <div className="dash-box-header">
              <h2 className="dash-box-title">Inscriptions - Août 2026</h2>
              <div className="dash-box-header-right">
                <span className="dash-box-badge">8 inscriptions</span>
                <span className="dash-box-trend-arrow">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                  <span className="dash-box-trend-pct">{mayTrendPct}%</span>
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={mayData} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="lineGradBlue" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 8px 32px rgba(15,23,42,0.15)',
                    fontSize: '0.85rem',
                  }}
                  formatter={(value, name) => [
                    value,
                    name === 'cumul' ? 'Cumulé' : 'Par jour',
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="inscriptions"
                  stroke="url(#lineGradBlue)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#4f46e5', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                  name="Par jour"
                />
                <Line
                  type="monotone"
                  dataKey="cumul"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  activeDot={{ r: 5, fill: '#a78bfa', stroke: '#fff', strokeWidth: 2 }}
                  name="Cumulé"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-col-5">
          <div className="dash-box dash-box-pie">
            <div className="dash-box-header">
              <h2 className="dash-box-title">Formations par catégorie</h2>
            </div>
            {categoryData.length === 0 ? (
              <p className="dash-empty">Aucune donnée</p>
            ) : (
              <div className="dash-pie-wrap">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      strokeWidth={0}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="dash-pie-center">
                  <span className="dash-pie-center-value">{stats.totalFormations}</span>
                  <span className="dash-pie-center-label">Total</span>
                </div>
                <div className="dash-pie-legend">
                  {categoryData.map((entry, i) => (
                    <div className="dash-pie-legend-item" key={entry.name}>
                      <span className="dash-pie-legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="dash-pie-legend-name">{entry.name}</span>
                      <span className="dash-pie-legend-val">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 2: Users donut + Bar charts ── */}
      <div className="dash-row">
        <div className="dash-box dash-box-users">
          <div className="dash-box-header">
            <h2 className="dash-box-title">Répartition des utilisateurs</h2>
          </div>
          {userData.length === 0 ? (
            <p className="dash-empty">Aucune donnée</p>
          ) : (
            <div className="dash-users-wrap">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={userData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {userData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="dash-users-stats">
                {userData.map((d) => (
                  <div className="dash-users-stat" key={d.name}>
                    <span className="dash-users-dot" style={{ background: d.fill }} />
                    <div className="dash-users-stat-info">
                      <span className="dash-users-stat-val">{d.value}</span>
                      <span className="dash-users-stat-name">{d.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dash-box">
          <div className="dash-box-header">
            <h2 className="dash-box-title">Cours par formation</h2>
            <span className="dash-box-badge">{Object.values(stats.coursesPerFormation).reduce((a, b) => a + b, 0)} cours</span>
          </div>
          {coursesData.length === 0 ? (
            <p className="dash-empty">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={coursesData} margin={{ top: 10, right: 20, left: -10, bottom: 40 }} barSize={32}>
                <defs>
                  {GRADIENT_COLORS.map((gc, i) => (
                    <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gc.start} />
                      <stop offset="100%" stopColor={gc.end} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-30} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                />
                <Bar dataKey="courses" radius={[8, 8, 0, 0]} name="Cours">
                  {coursesData.map((_, index) => (
                    <Cell key={index} fill={`url(#barGrad${index % GRADIENT_COLORS.length})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Row 3: Reviews + Enrollments per formation ── */}
      <div className="dash-row">
        <div className="dash-box">
          <div className="dash-box-header">
            <h2 className="dash-box-title">Avis par formation</h2>
            <span className="dash-box-badge">{stats.totalReviews} avis</span>
          </div>
          {reviewsData.length === 0 ? (
            <p className="dash-empty">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={reviewsData} margin={{ top: 10, right: 20, left: -10, bottom: 40 }} barSize={32}>
                <defs>
                  {GRADIENT_COLORS.map((gc, i) => (
                    <linearGradient key={i} id={`revGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gc.start} />
                      <stop offset="100%" stopColor={gc.end} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-30} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                />
                <Bar dataKey="reviews" radius={[8, 8, 0, 0]} name="Avis">
                  {reviewsData.map((_, index) => (
                    <Cell key={index} fill={`url(#revGrad${index % GRADIENT_COLORS.length})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {enrollmentsData.length > 0 && (
          <div className="dash-box">
            <div className="dash-box-header">
              <h2 className="dash-box-title">Inscriptions par formation</h2>
              <span className="dash-box-badge">{stats.totalEnrollments} inscriptions</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={enrollmentsData} margin={{ top: 10, right: 20, left: -10, bottom: 40 }} barSize={32}>
                <defs>
                  {GRADIENT_COLORS.map((gc, i) => (
                    <linearGradient key={i} id={`enrGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gc.start} />
                      <stop offset="100%" stopColor={gc.end} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-30} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                />
                <Bar dataKey="enrollments" radius={[8, 8, 0, 0]} name="Inscriptions">
                  {enrollmentsData.map((_, index) => (
                    <Cell key={index} fill={`url(#enrGrad${index % GRADIENT_COLORS.length})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Recent Formations ── */}
      <div className="dash-box dash-box-full dash-recent">
        <div className="dash-box-header">
          <h2 className="dash-box-title">Formations récentes</h2>
          <span className="dash-box-badge">Dernières 5</span>
        </div>
        <div className="dash-recent-list">
          {stats.recentFormations.map((f, i) => {
            const catIndex = categoryData.findIndex((c) => c.name === (f.category ?? 'Général'))
            const dotColor = COLORS[catIndex >= 0 ? catIndex % COLORS.length : i % COLORS.length]
            return (
              <div className="dash-recent-item" key={f.id}>
                {f.image ? (
                  <img className="dash-recent-thumb" src={f.image} alt="" />
                ) : (
                  <div className="dash-recent-thumb-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                      <path d="M4 19V5a2 2 0 012-2h13v16" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div className="dash-recent-info">
                  <span className="dash-recent-title">{f.title}</span>
                  <span className="dash-recent-cat">
                    <span className="dash-recent-dot" style={{ background: dotColor }} />
                    {f.category ?? 'Général'}
                  </span>
                </div>
                <div className="dash-recent-rating">
                  <span className="dash-recent-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={s <= Math.round(f.averageRating) ? 'dash-star-filled' : 'dash-star-empty'}>&#9733;</span>
                    ))}
                  </span>
                  <span className="dash-recent-score">{f.averageRating.toFixed(1)}</span>
                  <span className="dash-recent-count">({f.ratingCount})</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
