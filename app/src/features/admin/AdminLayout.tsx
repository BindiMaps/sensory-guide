import { useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { logout } from '@/lib/auth'

export function AdminLayout() {
  const { user, loading, initialised } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (initialised && !user) {
      navigate('/admin/login', { replace: true })
    }
  }, [user, initialised, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  // Show loading state while checking auth
  if (loading || !initialised) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/admin" className="text-xl font-semibold">
            Sensory Guide Admin
          </Link>
          <nav className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View Public Site
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
