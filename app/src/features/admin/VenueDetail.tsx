import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useVenue } from '@/shared/hooks/useVenue'
import { useAuthStore } from '@/stores/authStore'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function VenueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { venue, loading, error, addEditor, removeEditor, deleteVenue } = useVenue(id)
  const { user } = useAuthStore()

  const [newEditorEmail, setNewEditorEmail] = useState('')
  const [editorError, setEditorError] = useState('')
  const [addingEditor, setAddingEditor] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showSelfRemoveConfirm, setShowSelfRemoveConfirm] = useState(false)
  const [removingEditor, setRemovingEditor] = useState(false)

  useEffect(() => {
    document.title = venue ? `${venue.name} - Sensory Guide Admin` : 'Venue - Sensory Guide Admin'
  }, [venue])

  const handleAddEditor = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditorError('')

    const email = newEditorEmail.trim().toLowerCase()

    if (!isValidEmail(email)) {
      setEditorError('Please enter a valid email address')
      return
    }

    if (email === user?.email?.toLowerCase()) {
      setEditorError("You're already an editor")
      return
    }

    if (venue?.editors.map(e => e.toLowerCase()).includes(email)) {
      setEditorError('This person is already an editor')
      return
    }

    setAddingEditor(true)

    try {
      await addEditor(email)
      setNewEditorEmail('')
    } catch (err) {
      setEditorError(err instanceof Error ? err.message : 'Failed to add editor')
    } finally {
      setAddingEditor(false)
    }
  }

  const handleRemoveEditor = async (email: string) => {
    const isSelf = email.toLowerCase() === user?.email?.toLowerCase()

    if (isSelf && !showSelfRemoveConfirm) {
      setShowSelfRemoveConfirm(true)
      return
    }

    setRemovingEditor(true)
    try {
      await removeEditor(email)
      if (isSelf) {
        navigate('/admin', { replace: true })
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove editor')
    } finally {
      setRemovingEditor(false)
      setShowSelfRemoveConfirm(false)
    }
  }

  const handleDeleteVenue = async () => {
    if (deleteConfirmName !== venue?.name) {
      return
    }

    setDeleting(true)

    try {
      await deleteVenue()
      navigate('/admin', { replace: true })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete venue')
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading venue...</div>
  }

  if (error || !venue) {
    return (
      <div>
        <Link
          to="/admin"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
        >
          ← Back to venues
        </Link>
        <div className="text-red-600 bg-red-50 px-4 py-3 rounded-md">
          {error || 'Venue not found'}
        </div>
      </div>
    )
  }

  const isLastEditor = venue.editors.length === 1
  const currentUserIsEditor = user?.email && venue.editors.map(e => e.toLowerCase()).includes(user.email.toLowerCase())

  return (
    <div className="max-w-2xl">
      <Link
        to="/admin"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
      >
        ← Back to venues
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{venue.name}</h1>
          <p className="text-muted-foreground">/venue/{venue.slug}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            venue.status === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {venue.status}
        </span>
      </div>

      {/* Editor Management */}
      <section className="border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Editors</h2>

        <ul className="space-y-2 mb-4">
          {venue.editors.map((email) => (
            <li key={email} className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded">
              <span className="text-sm">
                {email}
                {email === venue.createdBy && (
                  <span className="text-xs text-muted-foreground ml-2">(owner)</span>
                )}
                {email.toLowerCase() === user?.email?.toLowerCase() && (
                  <span className="text-xs text-muted-foreground ml-2">(you)</span>
                )}
              </span>
              {!isLastEditor && currentUserIsEditor && (
                <button
                  onClick={() => handleRemoveEditor(email)}
                  className="text-sm text-red-600 hover:text-red-800"
                  title="Remove editor"
                  disabled={removingEditor}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>

        {showSelfRemoveConfirm && (
          <div className="mb-4 p-3 border border-amber-300 bg-amber-50 rounded-md">
            <p className="text-sm text-amber-800 mb-3">
              You're about to remove yourself from this venue. You will lose access and won't be able to edit it anymore.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSelfRemoveConfirm(false)}
                className="px-3 py-1.5 border rounded-md hover:bg-white text-sm"
                disabled={removingEditor}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveEditor(user?.email || '')}
                disabled={removingEditor}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 text-sm"
              >
                {removingEditor ? 'Removing...' : 'Remove myself'}
              </button>
            </div>
          </div>
        )}

        {venue.editors.length < 5 && (
          <form onSubmit={handleAddEditor} className="flex gap-2">
            <input
              type="email"
              value={newEditorEmail}
              onChange={(e) => setNewEditorEmail(e.target.value)}
              placeholder="Add editor by email"
              className="flex-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              disabled={addingEditor}
            />
            <button
              type="submit"
              disabled={addingEditor || !newEditorEmail.trim()}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
            >
              Add
            </button>
          </form>
        )}

        {venue.editors.length >= 5 && (
          <p className="text-sm text-muted-foreground">Maximum 5 editors per venue</p>
        )}

        {editorError && (
          <p className="text-sm text-red-600 mt-2">{editorError}</p>
        )}
      </section>

      {/* Guide Upload Placeholder */}
      <section className="border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Guide Content</h2>
        <p className="text-muted-foreground text-sm">
          PDF upload and guide generation will be available in Epic 3.
        </p>
      </section>

      {/* Delete Venue (only for last editor) */}
      {isLastEditor && currentUserIsEditor && (
        <section className="border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h2>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
            >
              Delete Venue
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-700">
                This will permanently delete <strong>{venue.name}</strong> and all its data.
                Type the venue name to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={venue.name}
                className="w-full px-3 py-2 border border-red-300 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={deleting}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteVenue}
                  disabled={deleting || deleteConfirmName !== venue.name}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmName('')
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-accent"
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
