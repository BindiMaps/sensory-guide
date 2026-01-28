import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/stores/authStore'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function CreateVenue() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    document.title = 'Create Venue - Sensory Guide Admin'
  }, [])

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(name))
    }
  }, [name, slugManuallyEdited])

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setSlug(slugify(value))
  }

  const checkSlugExists = async (slugToCheck: string): Promise<boolean> => {
    const venuesRef = collection(db, 'venues')
    const q = query(venuesRef, where('slug', '==', slugToCheck))
    const snapshot = await getDocs(q)
    return !snapshot.empty
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Venue name is required')
      return
    }

    if (!slug.trim()) {
      setError('Slug is required')
      return
    }

    if (!user?.email) {
      setError('You must be logged in')
      return
    }

    setSubmitting(true)

    try {
      const slugExists = await checkSlugExists(slug)
      if (slugExists) {
        setError('This slug is already taken')
        setSubmitting(false)
        return
      }

      const venueData = {
        name: name.trim(),
        slug: slug.trim(),
        status: 'draft',
        editors: [user.email],
        createdBy: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'venues'), venueData)
      navigate(`/admin/venues/${docRef.id}`, { replace: true })
    } catch (err) {
      console.error('Error creating venue:', err)
      setError('Failed to create venue. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md">
      <Link
        to="/admin"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
      >
        ← Back to venues
      </Link>
      <h1 className="text-3xl font-bold mb-6">Create New Venue</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Venue Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Sydney Opera House"
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={submitting}
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1">
            URL Slug
          </label>
          <div className="flex items-center">
            <span className="text-muted-foreground mr-1">/venue/</span>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="sydney-opera-house"
              className="flex-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={submitting}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Auto-generated from name. Edit if needed.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Venue'}
          </button>
          <Link
            to="/admin"
            className="px-4 py-2 border rounded-md hover:bg-accent"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
