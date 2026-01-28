import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export function GuidePage() {
  const { slug } = useParams()

  useEffect(() => {
    document.title = `${slug} - Sensory Guide`
  }, [slug])

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Venue: {slug}</h1>
      <p className="text-muted-foreground">
        Guide content will appear here.
      </p>
    </div>
  )
}
