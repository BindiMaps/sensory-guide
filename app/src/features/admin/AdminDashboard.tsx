import { useEffect } from 'react'

export function AdminDashboard() {
  useEffect(() => {
    document.title = 'Dashboard - Sensory Guide Admin'
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Venues</h1>
      <p className="text-muted-foreground">
        No venues yet. Create one to get started.
      </p>
    </div>
  )
}
