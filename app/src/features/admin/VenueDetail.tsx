import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

export function VenueDetail() {
  const { id } = useParams()

  useEffect(() => {
    document.title = 'Venue - Sensory Guide Admin'
  }, [])

  return (
    <div>
      <Link
        to="/admin"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
      >
        ← Back to venues
      </Link>
      <h1 className="text-3xl font-bold mb-6">Venue Details</h1>
      <p className="text-muted-foreground">
        Venue ID: {id}
      </p>
      <p className="text-muted-foreground mt-2">
        (Editor management and guide upload will be implemented in stories 2-4 and 3-1)
      </p>
    </div>
  )
}
