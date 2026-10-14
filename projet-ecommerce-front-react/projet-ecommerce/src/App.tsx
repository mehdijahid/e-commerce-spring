import { useCallback, useEffect, useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CourseList from './pages/CourseList'
import CourseDetail from './pages/CourseDetail'
import Admin from './admin/Admin'
import Account from './pages/Account'
import MyFormations from './pages/MyFormations'
import type { AccountUpdateResult, Formation, UserInfo } from './services/api'
import { fetchFormations, fetchMe, AuthError } from './services/api'
import { clearToken, getToken, setToken } from './services/auth'
import Footer from './components/Footer'

function App() {
  const [token, setAuthToken] = useState<string | null>(() => getToken())
  const [authView, setAuthView] = useState<'login' | 'register'>('login')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFormationId, setSelectedFormationId] = useState<number | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [adminOpen, setAdminOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [myFormationsOpen, setMyFormationsOpen] = useState(false)

  function handleLoginSuccess(newToken: string) {
    setToken(newToken)
    setAuthToken(newToken)
  }

  const goHome = useCallback(() => {
    setSelectedFormationId(null)
    setSelectedCourseId(null)
    setAdminOpen(false)
    setAccountOpen(false)
    setMyFormationsOpen(false)
  }, [])

  const handleLogout = useCallback(() => {
    clearToken()
    setAuthToken(null)
    setUserInfo(null)
    goHome()
  }, [goHome])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetchMe()
      .then((info) => {
        setUserInfo(info)
        if (info.role === 'ADMIN') {
          setAdminOpen(true)
        }
      })
      .catch((err) => {
        if (err instanceof AuthError) {
          handleLogout()
          return
        }
      })
    fetchFormations()
      .then(setFormations)
      .catch((err) => {
        if (err instanceof AuthError) {
          handleLogout()
          return
        }
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      })
      .finally(() => setLoading(false))
  }, [token, handleLogout])

  const refreshFormations = useCallback(() => {
    fetchFormations()
      .then(setFormations)
      .catch((err) => {
        if (err instanceof AuthError) {
          handleLogout()
        }
      })
  }, [handleLogout])

  function handleAccountUpdated(result: AccountUpdateResult) {
    setToken(result.token)
    setAuthToken(result.token)
    setUserInfo({ name: result.name, email: result.email, role: result.role })
  }

  function openMyFormations() {
    setSelectedFormationId(null)
    setSelectedCourseId(null)
    setAdminOpen(false)
    setAccountOpen(false)
    setMyFormationsOpen(true)
  }

  function openAccount() {
    setSelectedFormationId(null)
    setSelectedCourseId(null)
    setAdminOpen(false)
    setMyFormationsOpen(false)
    setAccountOpen(true)
  }

  if (!token) {
    return authView === 'register' ? (
      <Register onSuccess={handleLoginSuccess} onSwitchToLogin={() => setAuthView('login')} />
    ) : (
      <Login onSuccess={handleLoginSuccess} onSwitchToRegister={() => setAuthView('register')} />
    )
  }

  return (
    <>
      {!adminOpen && (
        <Navbar
          userName={userInfo?.name ?? ''}
          onLogout={handleLogout}
          isAdmin={userInfo?.role === 'ADMIN'}
          onGoAdmin={() => setAdminOpen(true)}
          onGoHome={goHome}
          onGoMyFormations={openMyFormations}
          onGoAccount={openAccount}
        />
      )}
      {adminOpen ? (
        <Admin userName={userInfo?.name ?? ''} onLogout={handleLogout} onGoAccount={openAccount} onAuthError={handleLogout} />
      ) : accountOpen ? (
        <Account
          userName={userInfo?.name ?? ''}
          email={userInfo?.email ?? ''}
          onBack={goHome}
          onAuthError={handleLogout}
          onUpdated={handleAccountUpdated}
        />
      ) : myFormationsOpen ? (
        <MyFormations
          onBack={goHome}
          onSelectFormation={setSelectedFormationId}
          onAuthError={handleLogout}
        />
      ) : selectedCourseId !== null ? (
        <CourseDetail
          courseId={selectedCourseId}
          onBack={() => setSelectedCourseId(null)}
          onAuthError={handleLogout}
        />
      ) : selectedFormationId === null ? (
        <Home
          formations={formations}
          loading={loading}
          error={error}
          onSelectFormation={setSelectedFormationId}
          onRefresh={refreshFormations}
          onAuthError={handleLogout}
        />
      ) : (
        <CourseList
          formationId={selectedFormationId}
          onBack={() => setSelectedFormationId(null)}
          onSelectCourse={setSelectedCourseId}
          onAuthError={handleLogout}
        />
      )}
      <Footer formations={formations} />
    </>
  )
}

export default App
