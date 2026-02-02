import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AllowListManager } from './AllowListManager'
import { GlobalAnalytics } from './GlobalAnalytics'

export function SuperAdminDashboard() {
  useEffect(() => {
    document.title = 'Super Admin - Sensory Guide'
  }, [])

  return (
    <div className="max-w-2xl">
      <Link
        to="/admin"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
      >
        ← Back to dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6">Super Admin</h1>

      <section className="border rounded-lg p-4 mb-6">
        <AllowListManager />
      </section>

      <hr className="my-6 border-border" />

      <section className="border rounded-lg p-4 mb-6">
        <GlobalAnalytics />
      </section>
    </div>
  )
}
