import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export function NotFound() {
  useEffect(() => {
    document.title = 'Page Not Found - Sensory Guide'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found</p>
        <Link
          to="/"
          className="text-primary underline underline-offset-4 hover:text-primary/80"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
