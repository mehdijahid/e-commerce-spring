import { getToken } from './auth'

export interface Formation {
  id: number
  title: string
  description: string | null
  category: string | null
  image: string | null
  averageRating: number
  ratingCount: number
}

export interface Course {
  id: number
  title: string
  content: string | null
  image: string | null
  completed: boolean
  averageRating: number
  ratingCount: number
}

export interface FormationDetail extends Formation {
  courses: Course[]
  completedCount: number
  totalCount: number
  userRating: number | null
  reviews: Review[]
}

export interface Review {
  id: number
  userName: string
  rating: number
  comment: string | null
}

export interface CourseImage {
  position: number
  image: string
}

export interface CourseDetail {
  id: number
  title: string
  content: string | null
  details: string | null
  image: string | null
  images: CourseImage[]
  userRating: number | null
  averageRating: number
  ratingCount: number
  completed: boolean
  reviews: Review[]
}

export interface UserInfo {
  name: string
  email: string
  role: string
}

export interface MyFormation extends Formation {
  completedCount: number
  totalCount: number
}

export interface AccountUpdateInput {
  name: string
  email: string
  currentPassword: string
  newPassword: string | null
}

export interface AccountUpdateResult {
  name: string
  email: string
  role: string
  token: string
}

export interface FormationInput {
  title: string
  description: string | null
  category: string | null
  image: string | null
}

export interface CourseInput {
  title: string
  content: string | null
  details: string | null
  image: string | null
  images: string[]
}

export interface AdminStats {
  totalUsers: number
  totalAdminUsers: number
  totalRegularUsers: number
  totalFormations: number
  totalCourses: number
  totalEnrollments: number
  totalReviews: number
  averageRating: number
  formationsByCategory: Record<string, number>
  coursesPerFormation: Record<string, number>
  reviewsPerFormation: Record<string, number>
  enrollmentsPerFormation: Record<string, number>
  enrollmentsByDate: Record<string, number>
  recentFormations: Formation[]
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  active: boolean
}

export class AuthError extends Error {}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function jsonHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json', ...authHeaders() }
}

async function handle(res: Response): Promise<unknown> {
  if (res.status === 401 || res.status === 403) {
    throw new AuthError('Session expirée, veuillez vous reconnecter.')
  }
  if (!res.ok) {
    const body = await res.text()
    let message: string | null = null
    try {
      const parsed = JSON.parse(body)
      if (typeof parsed?.message === 'string') {
        message = parsed.message
      }
    } catch {
      // corps non JSON, on garde le message générique
    }
    throw new Error(message ?? `Erreur HTTP ${res.status}`)
  }
  return res.json()
}

export async function fetchFormations(): Promise<Formation[]> {
  const res = await fetch('/api/formations', { headers: authHeaders() })
  return handle(res) as Promise<Formation[]>
}

export async function fetchFormationDetail(id: number): Promise<FormationDetail> {
  const res = await fetch(`/api/formations/${id}`, { headers: authHeaders() })
  return handle(res) as Promise<FormationDetail>
}

export async function fetchCourseDetail(id: number): Promise<CourseDetail> {
  const res = await fetch(`/api/courses/${id}`, { headers: authHeaders() })
  return handle(res) as Promise<CourseDetail>
}

export async function rateCourse(id: number, rating: number, comment?: string): Promise<void> {
  const res = await fetch(`/api/courses/${id}/rating`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ rating, comment: comment ?? null }),
  })
  await handle(res)
}

export async function rateFormation(id: number, rating: number, comment?: string): Promise<void> {
  const res = await fetch(`/api/formations/${id}/rating`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ rating, comment: comment ?? null }),
  })
  await handle(res)
}

export async function completeCourse(id: number): Promise<void> {
  const res = await fetch(`/api/courses/${id}/complete`, {
    method: 'POST',
    headers: authHeaders(),
  })
  await handle(res)
}

export async function fetchMe(): Promise<UserInfo> {
  const res = await fetch('/api/auth/me', { headers: authHeaders() })
  return handle(res) as Promise<UserInfo>
}

export async function updateAccount(data: AccountUpdateInput): Promise<AccountUpdateResult> {
  const res = await fetch('/api/auth/account', {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  })
  return handle(res) as Promise<AccountUpdateResult>
}

export async function fetchMyFormations(): Promise<MyFormation[]> {
  const res = await fetch('/api/my-formations', { headers: authHeaders() })
  return handle(res) as Promise<MyFormation[]>
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  })
  const data = (await handle(res)) as { url: string }
  return data.url
}

export async function createFormation(data: FormationInput): Promise<Formation> {
  const res = await fetch('/api/admin/formations', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  })
  return handle(res) as Promise<Formation>
}

export async function updateFormation(id: number, data: FormationInput): Promise<Formation> {
  const res = await fetch(`/api/admin/formations/${id}`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  })
  return handle(res) as Promise<Formation>
}

export async function deleteFormation(id: number): Promise<void> {
  const res = await fetch(`/api/admin/formations/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  await handle(res)
}

export async function createCourse(formationId: number, data: CourseInput): Promise<Course> {
  const res = await fetch(`/api/admin/formations/${formationId}/courses`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  })
  return handle(res) as Promise<Course>
}

export async function updateCourse(id: number, data: CourseInput): Promise<Course> {
  const res = await fetch(`/api/admin/courses/${id}`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  })
  return handle(res) as Promise<Course>
}

export async function deleteCourse(id: number): Promise<void> {
  const res = await fetch(`/api/admin/courses/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  await handle(res)
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch('/api/admin/stats', { headers: authHeaders() })
  return handle(res) as Promise<AdminStats>
}

export interface AdminReview {
  id: number
  userName: string
  targetType: string
  targetTitle: string
  rating: number
  comment: string | null
}

export async function fetchAdminReviews(): Promise<AdminReview[]> {
  const res = await fetch('/api/admin/reviews', { headers: authHeaders() })
  return handle(res) as Promise<AdminReview[]>
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/users', { headers: authHeaders() })
  return handle(res) as Promise<AdminUser[]>
}

export async function updateAdminUser(id: number, data: { role?: string; active?: boolean }): Promise<AdminUser> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  })
  return handle(res) as Promise<AdminUser>
}

export async function deleteAdminUser(id: number): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  await handle(res)
}

export async function enrollInFormation(formationId: number): Promise<void> {
  const res = await fetch(`/api/enrollments/${formationId}`, {
    method: 'POST',
    headers: jsonHeaders(),
  })
  await handle(res)
}

export async function checkEnrollmentStatus(formationId: number): Promise<boolean> {
  const res = await fetch(`/api/enrollments/${formationId}/status`, { headers: authHeaders() })
  const data = (await handle(res)) as { enrolled: boolean }
  return data.enrolled
}
