import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export function HomePage() {
  useEffect(() => {
    document.title = 'Sensory Guide - BindiMaps'
  }, [])

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-4xl font-bold mb-6">Sensory Guide</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Helping people with sensory sensitivities plan venue visits with confidence.
      </p>
      <Link
        to="/admin"
        className="text-primary underline underline-offset-4 hover:text-primary/80"
      >
        Admin Portal
      </Link>
    </div>
  )
}
